const Bugsnag = require('@bugsnag/js')

Bugsnag.start({ apiKey: 'b2d691b4013fdd59c5a1f5bc9a695b65' })

const bugsnagNotifyAsync = (error, onError) =>
    new Promise((resolve, reject) =>
        Bugsnag.notify(error, onError, (err, res) =>
            err ? reject(err) : resolve(res)
        )
    );

const bugsnagWrapper = async (handler) => {
    try {
        return await handler();
    } catch (e) {
        console.log(e);
        await bugsnagNotifyAsync(e);
        throw e;
    }
}

module.exports = {
    bugsnagNotifyAsync,
    bugsnagWrapper
}
