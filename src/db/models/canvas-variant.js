'use strict';

module.exports = (sequelize, DataTypes) => {
    let CanvasVariant = sequelize.define('CanvasVariant', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        definition: {
            type: DataTypes.JSON
        },
        step_function_arn: {
            type: DataTypes.STRING,
            allowNull: false
        },
        criteria: {
            type: DataTypes.JSON
        },
        twilio_friendly_name_regex: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: '.*'
        }
    }, {
        sequelize: sequelize,
        modelName: 'CanvasVariant',
        tableName: 'canvas_variants',
        timestamps: false,
        underscored: true
    });
    CanvasVariant.associate = function (models) {
        CanvasVariant.belongsTo(models.Canvas,
            { foreignKey: { allowNull: false, name: 'canvas_id' } });
    };
    return CanvasVariant;
};
