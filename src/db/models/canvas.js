'use strict';

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Canvas', {
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
        }
    }, {
        sequelize: sequelize,
        modelName: 'Canvas',
        tableName: 'canvases',
        timestamps: false,
        underscored: true
    });
};
