'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('canvases', [{
            name: 'Intro'
        }], {});

        await queryInterface.bulkInsert('canvas_variants', [
            {
                canvas_id: 1,
                name: 'Are you still in business?',
                step_function_arn: 'arn:aws:states:us-east-1:817399776222:stateMachine:alm-verification-are-you-still-in-business',
                criteria: JSON.stringify({ "alm_variant": "a" })
            },
            {
                canvas_id: 1,
                name: 'Your website is down - ambiguous.',
                step_function_arn: 'arn:aws:states:us-east-1:817399776222:stateMachine:alm-verification-your-website-is-down-ambiguous',
                criteria: JSON.stringify({ "alm_variant": "b" })
            },
            {
                canvas_id: 1,
                name: 'Your website is down - direct offer.',
                step_function_arn: 'arn:aws:states:us-east-1:817399776222:stateMachine:alm-verification-your-website-is-down-direct',
                criteria: JSON.stringify({ "alm_variant": "c" })
            },
            {
                canvas_id: 1,
                name: 'Hard sell',
                step_function_arn: 'arn:aws:states:us-east-1:817399776222:stateMachine:alm-verification-hard-sell',
                criteria: JSON.stringify({ "alm_variant": "d" })
            },
        ], {});

        await queryInterface.bulkInsert('triggers', [{
            event: 'hubspot_deal_stage_verifying',
            canvas_id: 1
        }], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('triggers', null, {});
        await queryInterface.bulkDelete('canvases', null, {});
        await queryInterface.bulkDelete('variants', null, {});
    }
};
