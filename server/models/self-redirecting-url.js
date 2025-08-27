"use strict";

module.exports = (sequelize, DataTypes) => {
  const SelfRedirectingUrl = sequelize.define(
    "SelfRedirectingUrl",
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
        unique: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP AT TIME ZONE 'UTC'"),
      },
    },
    {
      tableName: "self_redirecting_urls",
      timestamps: true,
      underscored: true,
    }
  );

  return SelfRedirectingUrl;
};