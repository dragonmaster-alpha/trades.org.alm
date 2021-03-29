'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
        queryInterface.addColumn('canvas_variants', 'twilio_friendly_name_regex', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: '.*'
        }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn('canvas_variants', 'twilio_friendly_name_regex')]);
  }
};
