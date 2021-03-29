const hubspot = require('@hubspot/api-client');
const hubspotDev = JSON.parse(process.env.HUBSPOT_DEV_DETAILS);
const hubspotClient = new hubspot.Client({ apiKey: process.env.HUBSPOT_API_KEY, numberOfApiCallRetries: 6 });

async function getDeal(dealId, properties) {
    const res = await hubspotClient.crm.deals.basicApi.getById(dealId, properties);
    return res.response.body.properties;
}

async function updateDeal(business, properties) {
    if (business.mappings && business.mappings.hubspot && business.mappings.hubspot.dealId) {
        console.log(business.mappings.hubspot.dealId);
        return hubspotClient.crm.deals.basicApi.update(
            business.mappings.hubspot.dealId, { properties });
    }
}

async function updateCompany(business, properties) {
    if (business.mappings && business.mappings.hubspot && business.mappings.hubspot.companyId) {
        console.log(business.mappings.hubspot.companyId);
        return hubspotClient.crm.companies.basicApi.update(
            business.mappings.hubspot.companyId, { properties });
    }
}

async function createTimelineEvent(dealId, eventTemplateId, templateTokens) {
    try {
        const response = await hubspotClient.oauth.defaultApi.createToken(
            'refresh_token',
            null,
            null,
            hubspotDev.clientId,
            hubspotDev.clientSecret,
            hubspotDev.refreshToken
        );

        await hubspotClient.crm.timeline.eventsApi.create(
            {
                eventTemplateId: eventTemplateId,
                objectId: dealId,
                tokens: templateTokens
            },
            {
                headers: {
                    authorization: `Bearer ${response.body.accessToken}`
                }
            }
        )
    } catch (e) {
        console.log(e);
    }
}

async function createOutboundSmsEvent(dealId, from, to, body) {
    await createTimelineEvent(dealId, 1007674, {
        phoneFrom: from,
        phoneTo: to,
        textBody: body,
        direction: 'Outbound'
    });
}

async function createInboundSmsEvent(dealId, from, to, body) {
    await createTimelineEvent(dealId, 1007674, {
        phoneFrom: from,
        phoneTo: to,
        textBody: body,
        direction: 'Inbound'
    });
}

async function createWaitEvent(dealId, timestamp) {
    await createTimelineEvent(dealId, 1007675, {
        waitTimestamp: timestamp
    });
}

async function createNewJourneyEvent(dealId, journey) {
    await createTimelineEvent(dealId, 1007676, { journey });
}

async function createEndJourneyEvent(dealId, journey, status, endReason) {
    await createTimelineEvent(dealId, 1007677, {
        journey,
        status,
        endReason
    });
}

module.exports = {
    getDeal,
    updateDeal,
    updateCompany,
    createOutboundSmsEvent,
    createInboundSmsEvent,
    createWaitEvent,
    createNewJourneyEvent,
    createEndJourneyEvent
}