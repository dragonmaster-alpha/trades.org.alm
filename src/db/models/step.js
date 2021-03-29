'use strict';

module.exports = (sequelize, DataTypes) => {
    let Step = sequelize.define('Step', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        step: {
            type: DataTypes.STRING,
            allowNull: false
        },
        attributes: {
            type: DataTypes.JSON
        },
        error: {
            type: DataTypes.STRING
        },
        executed_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize: sequelize,
        modelName: 'Step',
        tableName: 'steps',
        timestamps: false,
        underscored: true
    });
    Step.associate = function (models) {
        Step.belongsTo(models.Journey,
            { foreignKey: { allowNull: false, name: 'journey_id' } });
    };
    return Step;
};
