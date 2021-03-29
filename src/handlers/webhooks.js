const { Step, Canvas, CanvasVariant, Trigger, Journey, sequelize, Sequelize } = require('../db/models');
const { getBusinessById, getBusinessByPhone } = require('../mongodb/businesses');
const { startStepFunctionExecution, stopStepFunctionExecution } = require('../aws/step-function');
const { publishHubspotWebhookMessage } = require('../aws/sns');
const { bugsnagNotifyAsync } = require('../bugsnag');
const { getMessageDetails } = require('../twilio');
const hubspot = require('../hubspot');
const qs = require('qs');

// Deal stages
const STAGE_VERIFYING = '4450897';

// Hubspot properties
const PROPERTY_DEAL_STAGE = 'dealstage';
const PROPERTY_ALM_FAUX_CUSTOMER_ENROLL_VALUE = 'Enroll';
const PROPERTY_ALM_FAUX_CUSTOMER = 'alm_faux_customer';

// ALM Trigger names
const TRIGGER_NAME_DEAL_STAGE = 'hubspot_deal_stage_verifying';
const TRIGGER_NAME_ALM_FAUX_CUSTOMER = 'hubspot_deal_alm_faux_customer_enrolled';


module.exports.hubspotWebhook = async (event, context) => {
    try {
        await publishHubspotWebhookMessage(event.body);
        return {
            statusCode: 204
        };
    } catch (e) {
        await bugsnagNotifyAsync(e);
        return {
            statusCode: 500
        };
    }
};

module.exports.handleHubspotEvent = async (event, context) => {
    try {
        for (const record of event.Records) {
            const items = JSON.parse(record.Sns.Message);

            for (const item of items) {
                console.log(item);

                // If deal is moved into Verifying stage || alm_faux_customer has been set to 'Enroll'
                // Start corresponding journey(s)

                if (item.subscriptionType === 'deal.propertyChange') {
                    if (item.propertyName === PROPERTY_DEAL_STAGE && item.propertyValue === STAGE_VERIFYING) {
                        console.log(`Deal moved into Verifying stage: ${item.objectId}`);
                        await processHubspotEvent(item, TRIGGER_NAME_DEAL_STAGE);
                    }

                    if (item.propertyName === PROPERTY_ALM_FAUX_CUSTOMER && item.propertyValue === PROPERTY_ALM_FAUX_CUSTOMER_ENROLL_VALUE) {
                        console.log(`Deal alm_faux_customer property has been set to Enroll: ${item.objectId}`);
                        await processHubspotEvent(item, TRIGGER_NAME_ALM_FAUX_CUSTOMER);
                    }
                }
            }
        }
    } catch (e) {
        console.log(e);
        await bugsnagNotifyAsync(e);
    }
};

module.exports.handleSmsStatusPostback = async (event, context) => {
    try {
        console.log(`Processing ${event.Records.length} records`);

        await Promise.all(event.Records.map(async record => {
            const body = qs.parse(record.Sns.Message);
            console.log(body);

            // SMS failed
            if (body.MessageStatus === 'failed' || body.MessageStatus === 'undelivered') {
                const business = await getBusinessByPhone(body.To);
                if (business) {
                    await Promise.all([
                        stopActiveJourneys(business, 'SMS delivery failed', 'failed'),
                        hubspot.updateCompany(business, { unreachable_via_text: true }),
                        hubspot.updateDeal(business, { unreachable_via_text: true })
                    ]);
                } else {
                    console.log(`Business not found for phone: ${body.To}`);
                }
            }
        }));
    } catch (e) {
        console.log(e);
        await bugsnagNotifyAsync(e);
    }
};

module.exports.handleIncomingSms = async (event, context) => {
    try {
        console.log(`Processing ${event.Records.length} records`);

        await Promise.all(event.Records.map(async record => {
            const body = qs.parse(record.Sns.Message);
            console.log(body);

            if (body.interactionType === 'Message' && body.inboundResourceSid.startsWith('SM')) {
                const twilioMessage = await getMessageDetails(body.inboundResourceSid);
                const business = await getBusinessByPhone(twilioMessage.from);

                if (business) {
                    await Promise.all([
                        stopActiveJourneys(business, 'Received Reply'),
                        hubspot.updateDeal(business, { needs_follow_up: true }),
                        hubspot.updateCompany(business, { needs_follow_up: true })
                    ]);
                } else {
                    console.log(`Business not found for phone: ${twilioMessage.from}`);
                }
            }
        }));
    } catch (e) {
        console.log(e);
        await bugsnagNotifyAsync(e);
    }
};

module.exports.handleAnsweredCall = async (event, context) => {
    try {
        console.log(`Processing ${event.Records.length} records`);

        await Promise.all(event.Records.map(async record => {
            const body = JSON.parse(record.Sns.Message);
            console.log(body);

            const { phone, isOutbound } = body;
            const business = await getBusinessByPhone(phone);
            if (business) {
                await Promise.all([
                    stopActiveJourneys(business, isOutbound ? 'Reached by Phone' : 'Received Call')
                ]);
            } else {
                console.log(`Business not found for phone: ${phone}`);
            }
        }));
    } catch (e) {
        console.log(e);
        await bugsnagNotifyAsync(e);
    }
};

module.exports.handleIncomingCall = async (event, context) => {
    try {
        console.log(`Processing ${event.Records.length} records`);

        await Promise.all(event.Records.map(async record => {
            const body = JSON.parse(record.Sns.Message);
            console.log(body);

            const { from } = body;
            const business = await getBusinessByPhone(from);

            if (business) {
                const journeys = await findActiveJourneysByBusinessId(business._id);
                let phoneNumber;
                let shouldStartCallResponse = false;

                // Find journey Faux initial customer
                // Stop that journey and save number from previous Steps
                // Set boolean field in order to start or NOT start call response journey

                for (const journey of journeys) {
                    const canvasVariant = await journey.getCanvasVariant({ include: [Canvas] });
                    if (canvasVariant.Canvas.name === 'Faux initial customer') {
                        console.log(`Found 'Faux initial customer' journey`);
                        await stopJourney(journey, 'canceled', 'Received Call', business);
                        phoneNumber = await getPhoneNumberFromPreviousStepsByJourneyId(journey.id);
                        console.log(`Phone number from previous steps: ${phoneNumber}`);
                        shouldStartCallResponse = true;
                    } else {
                        console.log(`Faux initial customer is not running: ${from}`);
                    }
                }

                if (shouldStartCallResponse) {
                    const deal = await hubspot.getDeal(business.mappings.hubspot.dealId, ['trades_business_id', 'alm_variant']);
                    await triggerJourneys('hubspot_deal_alm_faux_customer_call_response', deal, business, { fromNumber: phoneNumber });
                }
            } else {
                console.log(`Business not found for phone: ${from}`);
            }
        }));
    } catch (e) {
        console.log(e);
        await bugsnagNotifyAsync(e);
    }
};

module.exports.handleStepFunctionExecutionStateChange = async (event, context) => {
    try {
        console.log(event);

        const { detail } = event;

        const journey = await Journey.findOne({ where: { execution_arn: detail.executionArn } });
        if (journey && ['FAILED', 'SUCCEEDED', 'TIMED_OUT'].indexOf(detail.status) !== -1) {
            const status = detail.status === 'SUCCEEDED' ? 'completed' : 'failed';

            await journey.update({
                ended_at: new Date(),
                status: status
            });

            const [canvasVariant, business] = await Promise.all([
                journey.getCanvasVariant({ include: [Canvas] }),
                getBusinessById(journey.business_id)
            ]);
            await hubspot.createEndJourneyEvent(
                business.mappings.hubspot.dealId,
                `${canvasVariant.Canvas.name} - ${canvasVariant.name}`,
                status,
                detail.status === 'SUCCEEDED' ? 'All steps completed' : 'An error occurred');

            if (canvasVariant.Canvas.name === 'Faux initial customer') {
                await hubspot.updateDeal(business, { alm_faux_customer: detail.status === 'SUCCEEDED' ? 'Completed' : 'Failed' });
            }

        }
    } catch (e) {
        console.log(e);
        await bugsnagNotifyAsync(e);
    }
};

async function processHubspotEvent(item, triggerName) {

    // Get business info from Hubspot deal
    const deal = await hubspot.getDeal(item.objectId, ['trades_business_id', 'alm_variant']);
    const businessId = deal.trades_business_id;
    if (!businessId) {
        throw new Error(`Unknown business for deal: ${item.objectId}`);
    }

    const business = await getBusinessById(businessId);
    if (!business) {
        throw new Error(`Couldn't find business with id : ${businessId}`);
    }
    console.log(`Found business for deal: ${business._id}`);

    await triggerJourneys(triggerName, deal, business);
}

async function triggerJourneys(triggerName, deal, business, params = {}) {
    const triggers = await Trigger.findAll({
        where: { event: triggerName },
        include: [{ model: Canvas }]
    });

    for (const trigger of triggers) {
        const canvas = trigger.Canvas;
        const variants = await CanvasVariant.findAll({
            where: { canvas_id: canvas.id }
        });

        // Choose canvas variant
        let matchingVariants;
        if (deal.alm_variant && deal.alm_variant.length) {
            matchingVariants = variants.filter(variant => variant.criteria.alm_variant === deal.alm_variant);
        } else {
            matchingVariants = variants;
        }
        if (matchingVariants.length === 0) {
            throw new Error(`No matching canvas variants found for deal ${business.mappings.hubspot.dealId}`);
        }
        const variant = matchingVariants[Math.floor(Math.random() * Math.floor(matchingVariants.length))];

        await Promise.all([
            startJourney(business.mappings.hubspot.dealId, business, trigger, variant, `${deal.trades_business_id}_${business.mappings.hubspot.dealId}_${canvas.id}`, params),
            hubspot.updateDeal(business, { alm_variant: variant.criteria.alm_variant })
        ]);
    }
}

async function startJourney(dealId, business, trigger, variant, executionName, params) {
    const stepFunctionArn = variant.step_function_arn;

    // Start Journey
    const journey = await Journey.create({
        business_id: business._id,
        canvas_variant_id: variant.id,
    });

    try {
        // Start Step Function
        const input = {
            journey_id: journey.id,
            business: business,
            params: {
                ...trigger.params,
                ...params
            }
        };
        const result = await startStepFunctionExecution(
            stepFunctionArn, executionName, input);

        console.log(`Started ALM for ${business._id} (phone: ${business.phone}): ${result.executionArn}`);

        // Update journey with execution ARN
        // Log journey start in Hubspot
        await Promise.all([
            hubspot.createNewJourneyEvent(dealId, `${trigger.Canvas.name} - ${variant.name}`),
            journey.update({ execution_arn: result.executionArn })
        ]);
    } catch (e) {
        await journey.update({
            status: 'failed',
            ended_at: new Date()
        });

        throw e;
    }
}


async function stopActiveJourneys(business, stopReason, status = 'canceled') {
    const journeys = await findActiveJourneysByBusinessId(business._id);

    console.log(`Stopping ${journeys.length} journeys for ${business.phone}. Reason: ${stopReason}`);

    await Promise.all(journeys.map(async journey => await stopJourney(journey, status, stopReason, business)));
}

async function stopJourney(journey, status, stopReason, business) {
    if (journey.execution_arn) {
        await stopStepFunctionExecution(journey.execution_arn);
    }
    const canvasVariant = await journey.getCanvasVariant({ include: [Canvas] });

    await Promise.all([
        journey.update({
            status: status,
            ended_at: new Date(),
            end_reason: stopReason
        }),
        hubspot.createEndJourneyEvent(
            business.mappings.hubspot.dealId,
            `${canvasVariant.Canvas.name} - ${canvasVariant.name}`,
            status,
            stopReason)
    ]);
}

async function findActiveJourneysByBusinessId(businessId) {
    return Journey.findAll({
        where: {
            business_id: businessId,
            status: 'active'
        }
    });
}

async function getPhoneNumberFromPreviousStepsByJourneyId(journey_id) {
    const previousSteps = await Step.findAll(
        {
            where: {
                journey_id: journey_id,
                [Sequelize.Op.and]: sequelize.literal(`attributes ->> 'type' = 'communication'`),
                [Sequelize.Op.and]: sequelize.literal(`attributes ->> 'from' is not null`)
            },
            order: [['executed_at', 'DESC']],
            limit: 1
        });

    return previousSteps[0].attributes.from;
}
