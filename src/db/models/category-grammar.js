'use strict';

module.exports = (sequelize, DataTypes) => {
    return sequelize.define('CategoryGrammar', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
            allowNull: false
        },
        key: {
            type: DataTypes.STRING,
            allowNull: false
        },
        proNoun: {
            type: DataTypes.STRING,
        },
        taskNoun: {
            type: DataTypes.STRING,
        },
        taskActionVerb: {
            type: DataTypes.STRING,
        },
        taskAdjective: {
            type: DataTypes.STRING,
        }
    }, {
        sequelize: sequelize,
        modelName: 'CategoryGrammar',
        tableName: 'category_grammar',
        timestamps: false,
        underscored: true
    });
};

