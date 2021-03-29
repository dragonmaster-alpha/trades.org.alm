const { Canvas, CanvasVariant } = require('../db/models');

async function getScripts() {
    return new Promise((resolve, reject) => {
        Promise.all([
            Canvas.findAll(),
            CanvasVariant.findAll(),
        ]).then(data => {
            const [canvases, variants] = data;

            const scripts = canvases.map(canvas => ({
                id: canvas.id,
                name: canvas.name,
                variants: variants.filter(v => v.canvas_id === canvas.id).map(variant => ({
                    id: variant.id,
                    script_id: variant.canvas_id,
                    name: variant.name,
                    description: variant.definition.description,
                    definition: variant.definition ? JSON.stringify(variant.definition) : null
                }))
            }));

            resolve(scripts);
        });
    });
}

async function getScriptVariant(id) {
    return new Promise((resolve, reject) => {
        CanvasVariant.findByPk(id)
            .then(variant => {
                resolve({
                    id: variant.id,
                    script_id: variant.canvas_id,
                    name: variant.name,
                    description: variant.definition.description,
                    definition: variant.definition ? JSON.stringify(variant.definition) : null
                });
            });
    });
}

exports.handleAppSyncInvocation = (event, context, callback) => {
    switch (event.field) {
        case 'getScripts':
            getScripts().then(result => {
                callback(null, result);
            });
            break;
        case 'getScriptVariant':
            const id = event.arguments.id;
            getScriptVariant(id).then(result => {
                callback(null, result);
            });
            break;
        default:
            callback(`Unknown field, unable to resolve ${event.field}`, null);
            break;
    }
};