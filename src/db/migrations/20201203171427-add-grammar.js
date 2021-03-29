'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
                `
                create table category_grammar
                (
                    id serial not null
                        constraint category_grammar_pk
                            primary key,
                    key varchar not null,
                    pro_noun varchar,
                    task_noun varchar,
                    task_action_verb varchar,
                    task_adjective varchar
                );
                `
        );
    },

    down: async (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
                `
                drop table category_grammar;
                `
        );
    }
};
