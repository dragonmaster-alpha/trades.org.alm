const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

async function getTokensFromDB() {
    const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

    const params = {
        TableName: 'mongodb-tokens',
        Key: {
            'id': { S: 'trades-org-messaging' }
        }
    };

    return new Promise((resolve, reject) => {
        ddb.getItem(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(AWS.DynamoDB.Converter.unmarshall(data.Item));
            }
        });
    });
}

async function storeTokensInDB(tokens) {
    const ddb = new AWS.DynamoDB({ apiVersion: '2012-08-10' });

    tokens.id = 'trades-org-messaging';
    const marshalled = AWS.DynamoDB.Converter.marshall(tokens);

    const params = {
        TableName: 'mongodb-tokens',
        Item: marshalled
    };

    return new Promise((resolve, reject) => {
        ddb.putItem(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    })
}

module.exports = {
    getTokensFromDB,
    storeTokensInDB
};
