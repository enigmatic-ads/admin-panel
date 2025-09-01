'use strict';

module.exports = (sequelize, DataTypes) => {
  const RedirectUrl = sequelize.define(
    "RedirectUrl",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true, 
        primaryKey: true,
        allowNull: false,
      },
      campaign_id: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
      redirect_url: {
        type: DataTypes.TEXT,
        allowNull: false,
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
      tableName: "redirect_urls",
      timestamps: true,
      underscored: true,
    }
  );

  return RedirectUrl;
};