const scripts = require('./raw.js');

function createDefinition(obj) {
    const definition = {
        "Comment": `${obj.name} - ${obj.description}`,
        "StartAt": "Step1",
        "States": {}
    };

    let i = 1;
    let prevStateName;
    for (const step of obj.steps) {
        let currStateName;

        if (step.action === 'communication' && step.channel === 'sms') {
            currStateName = `${i}.SMS`;
            definition.States[currStateName] = {
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                ResultPath: "$.result",
                Parameters: {
                    "FunctionName": "arn:aws:lambda:us-east-1:817399776222:function:trades-org-alm-send-sms",
                    "Payload": {
                        "step.$": "$$.State.Name",
                        "input.$": "$",
                        "body": {
                            "message": step.message
                        }
                    }
                }
            };
        } else if (step.action === 'wait') {
            let seconds, hours;
            if (step.delay && step.delay) {
                seconds = step.delay.seconds;
                hours = step.delay.hours;
            } else if (step.random) {
                seconds = step.random[0].seconds;
                hours = step.random[0].hours;
            }

            if (seconds) {
                currStateName = `${i}.Wait`;
                definition.States[currStateName] = {
                    Type: "Wait",
                    Seconds: seconds
                };
            } else if (hours) {
                // Calc wait time
                currStateName = `${i}.CalculateWaitTime`;
                definition.States[currStateName] = {
                    Type: "Task",
                    Resource: "arn:aws:states:::lambda:invoke",
                    Parameters: {
                        "FunctionName": "arn:aws:lambda:us-east-1:817399776222:function:trades-org-alm-calc-wait-time",
                        "Payload": {
                            "step.$": "$$.State.Name",
                            "input.$": "$",
                            "body": {
                                "amount": hours,
                                "unit": "hours"
                            }
                        }
                    },
                    ResultSelector: {
                        "timestamp.$": "$.Payload.timestamp"
                    },
                    ResultPath: "$.wait",
                    Next: `${i + 1}.Wait`
                };

                if (prevStateName) {
                    definition.States[prevStateName].Next = currStateName;
                } else {
                    definition.StartAt = currStateName;
                }
                prevStateName = currStateName;

                // Wait
                currStateName = `${i + 1}.Wait`;
                definition.States[`${i + 1}.Wait`] = {
                    Type: "Wait",
                    TimestampPath: "$.wait.timestamp" // todo uncomment
                    // Seconds: 5
                };

                i += 1;
            }
        } else if (step.action === 'update_hubspot') {
            currStateName = `${i}.UpdateHubspot`;
            definition.States[currStateName] = {
                "Type": "Task",
                "Resource": "arn:aws:states:::lambda:invoke",
                "Parameters": {
                    "FunctionName": "arn:aws:lambda:us-east-1:817399776222:function:trades-org-alm-update-hubspot",
                    "Payload": {
                        "step.$": "$$.State.Name",
                        "input.$": "$",
                        "body": {
                            "object_type": step.object_type,
                            "properties": step.properties
                        }
                    }
                }
            };
        }

        if (prevStateName) {
            definition.States[prevStateName].Next = currStateName;
        } else {
            definition.StartAt = currStateName;
        }

        i += 1;
        prevStateName = currStateName;
    }

    definition.States[prevStateName].End = true;
    return definition;
}

// console.log(JSON.stringify(createDefinition(scripts.intro_hard_sell), null, 2));