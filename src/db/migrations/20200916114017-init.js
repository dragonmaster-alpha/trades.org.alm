'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
                `
                    create table canvases
                    (
                        id   serial  not null,
                        name varchar not null
                    );

                    create unique index canvases_id_uindex
                        on canvases (id);

                    alter table canvases
                        add constraint table_name_pk
                            primary key (id);

                    create table canvas_variants
                    (
                        id                serial  not null,
                        canvas_id         int     not null
                            constraint canvas_variants_canvases_id_fk
                                references canvases,
                        name              varchar not null,
                        step_function_arn varchar not null,
                        criteria          json
                    );

                    create unique index canvas_variants_id_uindex
                        on canvas_variants (id);

                    alter table canvas_variants
                        add constraint canvas_variants_pk
                            primary key (id);

                    create table triggers
                    (
                        id        serial  not null,
                        event     varchar not null,
                        params    json,
                        canvas_id int
                            constraint triggers_canvases_id_fk
                                references canvases
                    );

                    create unique index triggers_id_uindex
                        on triggers (id);

                    alter table triggers
                        add constraint triggers_pk
                            primary key (id);


                    create table journeys
                    (
                        id                serial                     not null,
                        business_id       varchar                    not null,
                        canvas_variant_id int                        not null
                            constraint journeys_variants_id_fk
                                references canvas_variants,
                        execution_arn     varchar,
                        status            varchar   default 'active' not null,
                        end_reason        varchar,
                        started_at        timestamp default now()    not null,
                        ended_at          timestamp
                    );

                    create unique index journeys_id_uindex
                        on journeys (id);

                    create index journeys_business_id_index
                        on journeys (business_id);

                    create index journeys_execution_arn_index
                        on journeys (execution_arn);

                    alter table journeys
                        add constraint journeys_pk
                            primary key (id);


                    create table steps
                    (
                        id          serial                  not null,
                        journey_id  int                     not null
                            constraint steps_journeys_id_fk
                                references journeys,
                        step        varchar                 not null,
                        attributes  json,
                        error       varchar,
                        executed_at timestamp default now() not null
                    );

                    create unique index steps_id_uindex
                        on steps (id);

                    create index steps_journey_id_index
                        on steps (journey_id);

                    alter table steps
                        add constraint steps_pk
                            primary key (id);
            `
        );

    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.sequelize.query(
                `
                    drop table triggers;
                    drop table steps;
                    drop table journeys;
                    drop table canvas_variants;
                    drop table canvases;
            `
        );
    }
};
