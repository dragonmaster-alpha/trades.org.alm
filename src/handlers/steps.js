'use strict';

const { bugsnagWrapper } = require('../bugsnag');
const { Step, Journey, CanvasVariant, CategoryGrammar, sequelize, Sequelize } = require('../db/models');
const moment = require('moment-timezone');
const twilio = require('../twilio');
const hubspot = require('@hubspot/api-client');
const hubspotClient = new hubspot.Client({ apiKey: process.env.HUBSPOT_API_KEY, numberOfApiCallRetries: 6 });
const { stopStepFunctionExecution } = require('../aws/step-function');
const { createWaitEvent, createOutboundSmsEvent } = require('../hubspot');

const hubspotCrmMap = {
    'deal': 'deals',
    'company': 'companies'
};

class ExecutionStep {
    constructor(event) {
        console.log('-----------------------EVENT');
        console.log(event);

        this.step = event.step;
        this.journey_id = event.input.journey_id;
        this.input = event.input;
        this.body = event.body;

        if (!this.step || !this.journey_id || !this.input.business) {
            throw new Error('Invalid Step Configuration');
        }
    }

    async execute() {
        throw new Error('Not Implemented');
    }

    getAttributes() {
        return {};
    }

    async run() {
        try {
            // do work
            const result = await this.execute();

            // log success in DB
            await Step.create({
                journey_id: this.journey_id,
                step: this.step,
                attributes: this.getAttributes()
            });

            // return result
            return result;
        } catch (e) {
            // log error in DB
            await Step.create({
                journey_id: this.journey_id,
                step: this.step,
                attributes: this.getAttributes(),
                error: e.message
            });

            await Journey.update(
                {
                    ended_at: new Date(),
                    status: 'failed'
                },
                {
                    where: {
                        id: this.journey_id
                    }
                });

            // fail the task
            throw e;
        }
    }
}

class SendSmsStep extends ExecutionStep {
    async execute() {
        const to = this.input.business.phone;

        const journey = await Journey.findOne({
            where: { id: this.journey_id },
            include: [{ model: CanvasVariant }]
        });

        const from = await this.getFromNumber(to, journey.CanvasVariant.twilio_friendly_name_regex);
        const body = await this.prepareMessage(this.body.message, this.input.business);
        if (!body) {
            throw new Error('Message interpolation failed');
        }

        this.attributes = {
            type: 'communication',
            channel: 'sms',
            from: from,
            to: to,
            body: body,
        };

        const msg = await twilio.sendSms(to, from, body);

        this.attributes.sid = msg.sid;

        await createOutboundSmsEvent(this.input.business.mappings.hubspot.dealId, from, to, body);
    }

    async prepareMessage(messages, business) {
        if (typeof (messages) === 'string') messages = [messages];
        if (!Array.isArray(messages)) throw new Error('Invalid input for message');

        const topLevelCategories = ['local_services', 'property_improvement', 'real_estate', 'other'];
        const primaryCategories = (business.categories || []).filter(c => topLevelCategories.indexOf(c) === -1);
        const primaryCategory = primaryCategories.length ? primaryCategories[0] : null;

        const values = {
            business_name: business.name,
            website: business.website_host || business.website,
            city: business.location.city,
            zip: business.location.zip,
            state: business.location.state,
        };

        if (primaryCategory) {
            values.primary_category = primaryCategory.replace(/_/g, ' ');
            const grammar = await CategoryGrammar.findOne({ where: { key: primaryCategory } });
            if (grammar) {
                if (grammar.proNoun) values.primary_category_proNoun = grammar.proNoun;
                if (grammar.taskNoun) values.primary_category_taskNoun = grammar.taskNoun;
                if (grammar.taskActionVerb) values.primary_category_taskActionVerb = grammar.taskActionVerb;
                if (grammar.taskAdjective) values.primary_category_taskAdjective = grammar.taskAdjective;
            }
        }

        let customMessages = messages.filter(m => m.indexOf('{{') !== -1);
        let genericMessages = messages.filter(m => m.indexOf('{{') === -1);

        // Prioritize customized messages
        while (customMessages.length > 0) {
            // Get random message
            let index = Math.floor(Math.random() * Math.floor(customMessages.length));
            let message = customMessages.splice(index, 1)[0];

            // Interpolate
            message = this.interpolate(message, values);
            if (message.indexOf('{{') === -1) {
                return message;
            }
        }

        if (genericMessages.length) {
            return genericMessages[Math.floor(Math.random() * Math.floor(genericMessages.length))];
        }
    }

    interpolate(string, values) {
        return string.replace(/{{([^{}]*)}}/g,
            (substring, args) => {
                const r = values[args.trim()];
                return typeof r === 'string' || typeof r === 'number' ? r : substring;
            }
        );
    }

    async getFromNumber(to, twilioFriendlyNameRegex) {
        let from;

        if (this.input.params.fromNumber) {
            from = this.input.params.fromNumber;
        } else {
            // See if we have contacted this number before and re-use the from number
            const previousSteps = await Step.findAll(
                {
                    where: {
                        journey_id: this.journey_id,
                        [Sequelize.Op.and]: sequelize.literal(`attributes ->> 'type' = 'communication'`),
                        [Sequelize.Op.and]: sequelize.literal(`attributes ->> 'from' is not null`)
                    },
                    order: [['executed_at', 'DESC']],
                    limit: 1
                });

            if (previousSteps.length > 0) {
                from = previousSteps[0].attributes.from;
            } else {
                // Get an available number, preferably in the same area code as receiver
                from = await twilio.pickFromNumber(to, twilioFriendlyNameRegex);
            }
        }

        return from;
    }

    getAttributes() {
        return this.attributes;
    }
}

class UpdateHubspotStep extends ExecutionStep {
    async execute() {
        const { object_type, properties } = this.body;

        this.attributes = {
            type: 'update_hubspot',
            object_type,
            properties
        };

        await hubspotClient.crm[hubspotCrmMap[object_type]].basicApi.update(
            this.input.business.mappings.hubspot[object_type + 'Id'],
            { properties }
        );
    }

    getAttributes() {
        return this.attributes;
    }
}

class CalcWaitTimeStep extends ExecutionStep {
    async execute() {
        let { unit, amount, timezone } = this.body;
        timezone = timezone || 'America/Chicago';

        let nextTs = moment().tz(timezone).add(amount, unit);

        const windowStart = moment().tz(timezone).year(nextTs.year()).month(nextTs.month()).day(nextTs.day()).hour(9).minute(30).second(0).millisecond(0);
        const windowEnd = moment().tz(timezone).year(nextTs.year()).month(nextTs.month()).day(nextTs.day()).hour(20).minute(30).second(0).millisecond(0);

        if (nextTs.isBefore(windowStart)) {
            nextTs = windowStart;
        } else if (nextTs.isAfter(windowEnd)) {
            nextTs = windowStart.add(1, 'd');
        }

        const timestampDisplay = nextTs.format('MMM D, h:mm:ss A Z');
        const timestamp = nextTs.utc().format();

        this.attributes = {
            unit,
            amount,
            timezone,
            timestamp
        };

        await createWaitEvent(this.input.business.mappings.hubspot.dealId, timestampDisplay);

        return timestamp;
    }

    getAttributes() {
        return this.attributes;
    }
}

class StopAllActiveJourneysStep extends ExecutionStep {
    async execute() {
        const journeys = await Journey.findAll({
            where: {
                business_id: this.input.business._id,
                status: 'active'
            }
        }).filter(j => j.id !== this.journey_id);

        this.attributes = {
            execution_arns: journeys.map(j => j.execution_arn)
        };

        await Promise.all(journeys.map(j => {
            return stopStepFunctionExecution(j.execution_arn).then(() => {
                return j.update({
                    status: 'canceled',
                    ended_at: new Date(),
                    end_reason: this.input.params.end_reason
                });
            });
        }));
    }
}

module.exports.stopAllActiveJourneys = async (event, context) => {
    return await bugsnagWrapper(async () => {
        const step = new StopAllActiveJourneysStep(event);
        await step.run();
    });
};

module.exports.sendSms = async (event, context) => {
    return await bugsnagWrapper(async () => {
        const step = new SendSmsStep(event);
        await step.run();
    });
};

module.exports.updateHubspot = async (event, context) => {
    return await bugsnagWrapper(async () => {
        const step = new UpdateHubspotStep(event);
        await step.run();
    });
};

module.exports.calculateWaitTime = async (event, context) => {
    return await bugsnagWrapper(async () => {
        const step = new CalcWaitTimeStep(event);
        const timestamp = await step.run();

        return {
            timestamp
        };
    });
};
