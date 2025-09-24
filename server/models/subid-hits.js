'use strict';

module.exports = (sequelize, DataTypes) => {
  const SubidHit = sequelize.define(
    'SubidHit',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      subid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      remote_ip: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      client_ip: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      referer: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      tableName: 'subid_hits',
      timestamps: true,
      underscored: true,
    }
  );

  return SubidHit;
};
