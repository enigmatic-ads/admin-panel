'use strict';

module.exports = (sequelize, DataTypes) => {
    const FeedUrl = sequelize.define(
        'FeedUrl',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,   
            },
            url: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            source: {
                type: DataTypes.STRING(20),
                allowNull: false,
            },
            country: {
                type: DataTypes.STRING(50),
            },
            cap: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            available_cap: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            status: {
                type: DataTypes.STRING(20),
                allowNull: false,
                defaultValue: 'active',
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
            },
        },
        {
            tableName: "feed_urls",
            timestamps: true,
            underscored: true,
        }
    );

    return FeedUrl;
}