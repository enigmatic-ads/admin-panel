"use strict";

module.exports = (sequelize, DataTypes) => {
    const RefererData = sequelize.define(
        'RefererData',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,   
            },
            referer: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            source: {
                type: DataTypes.STRING(30),
                allowNull: false,
            },
            is_used: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
            }
        },
        {
            tableName: "referer_data",
            timestamps: true,
            underscored: true,
        }
    );

    return RefererData;
}

