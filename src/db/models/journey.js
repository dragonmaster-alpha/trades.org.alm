'use strict';

module.exports = (sequelize, DataTypes) => {
    let Journey = sequelize.define('Journey', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        business_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        execution_arn: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active'
        },
        end_reason: {
            type: DataTypes.STRING
        },
        started_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        ended_at: {
            type: DataTypes.DATE,
        }
    }, {
        sequelize: sequelize,
        modelName: 'Journey',
        tableName: 'journeys',
        timestamps: false,
        underscored: true
    });
    Journey.associate = function (models) {
        Journey.belongsTo(models.CanvasVariant,
            { foreignKey: { allowNull: false, name: 'canvas_variant_id' } });
    };
    return Journey;
};
