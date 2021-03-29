'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
                `alter table canvas_variants add definition json;`
        );
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
                `alter table canvas_variants drop column definition;`
        );
    }
};
