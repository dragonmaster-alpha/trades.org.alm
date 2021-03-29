const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const sns = new AWS.SNS({ apiVersion: '2012-11-05' });

async function publishHubspotWebhookMessage(message) {
    const topic = 'arn:aws:sns:us-east-1:817399776222:hubspot-webhook';

    return sns.publish({
        TopicArn: topic,
        Message: message
    }).promise();
}

module.exports = {
    publishHubspotWebhookMessage
}