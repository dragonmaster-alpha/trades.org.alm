'use strict';

const unidecode = require('unidecode');

const client = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

async function getSameAreaNumber(to, twilioFriendlyNameRegex) {
    let regex = new RegExp(twilioFriendlyNameRegex, 'g');
    let prefix = to.substring(0, 5);
    let numbers = (await client.incomingPhoneNumbers.list({ phoneNumber: prefix }))
        .filter(number => number.friendlyName.match(regex) && number.phoneNumber.startsWith(prefix))
        .map(n => n.phoneNumber)

    if (numbers.length > 0) {
        return numbers[Math.floor(Math.random() * Math.floor(numbers.length))];
    }

    return null;
}

async function getRandomAreaNumber(twilioFriendlyNameRegex) {
    let regex = new RegExp(twilioFriendlyNameRegex, 'g');
    let numbers = (await client.incomingPhoneNumbers.list())
        .filter(number => number.friendlyName.match(regex))
        .map(n => n.phoneNumber);

    if (numbers.length > 0) {
        return numbers[Math.floor(Math.random() * Math.floor(numbers.length))];
    }

    return null;
}

async function pickFromNumber(to, twilioFriendlyNameRegex) {
    const [randomAreaNumber, sameAreaNumber] = await Promise.all([
        getRandomAreaNumber(twilioFriendlyNameRegex),
        getSameAreaNumber(to, twilioFriendlyNameRegex)
    ]);

    return sameAreaNumber || randomAreaNumber;
}

async function sendSms(to, from, body) {
    return client.messages
        .create({
            to: to,
            from: from,
            body: unidecode(body),
            statusCallback: 'https://eh7dpve0ii.execute-api.us-east-1.amazonaws.com/production/twilio-sms-send-postback'
        });
}

async function getMessageDetails(messageSid) {
    return client.messages(messageSid).fetch();
}

module.exports = {
    sendSms,
    pickFromNumber,
    getMessageDetails
};
