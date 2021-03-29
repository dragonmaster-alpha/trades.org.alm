const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });

async function startStepFunctionExecution(stepFunctionArn, executionName, input = null) {
    return new Promise((resolve, reject) => {
        new AWS.StepFunctions().startExecution(
            {
                stateMachineArn: stepFunctionArn,
                input: JSON.stringify(input),
                name: executionName
            },
            (err, data) => {
                if (err) reject(err);
                else resolve(data);
            }
        )
    });
}

async function getStateMachineDefinition(arn) {
    return new Promise((resolve, reject) => {
        new AWS.StepFunctions().describeStateMachine(
            {
                stateMachineArn: arn
            },
            (err, data) => {
                if (err) reject(err);
                else resolve(JSON.parse(data.definition));
            });
    });
}

async function stopStepFunctionExecution(arn) {
    return new Promise((resolve, reject) => {
        new AWS.StepFunctions().stopExecution(
            {
                executionArn: arn
            },
            (err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
    });
}

module.exports = {
    startStepFunctionExecution,
    getStateMachineDefinition,
    stopStepFunctionExecution
};
