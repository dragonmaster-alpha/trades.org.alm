'use strict';

module.exports = (sequelize, DataTypes) => {
    let Trigger = sequelize.define('Trigger', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        event: {
            type: DataTypes.STRING,
            allowNull: false
        },
        params: {
            type: DataTypes.JSON
        }
    }, {
        sequelize: sequelize,
        modelName: 'Trigger',
        tableName: 'triggers',
        timestamps: false,
        underscored: true
    });
    Trigger.associate = function (models) {
        Trigger.belongsTo(models.Canvas,
            { foreignKey: { allowNull: false, name: 'canvas_id' } });
    };
    return Trigger;
};
