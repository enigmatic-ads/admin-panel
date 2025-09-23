'use strict';

module.exports = (sequelize, DataTypes) => {
  const ClientDetail = sequelize.define(
    'ClientDetail',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      url_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'RedirectUrl',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      feed_url_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'FeedUrl',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
      failure: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      campaign_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      failure_reason: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      session_id:{
        type: DataTypes.SMALLINT,
        allowNull: true,
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
      tableName: 'client_details',
      timestamps: true,
      underscored: true,
    }
  );

  ClientDetail.associate = (models) => {
    ClientDetail.belongsTo(models.RedirectUrl, {
      foreignKey: 'url_id',
      as: 'redirectUrl',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    ClientDetail.belongsTo(models.FeedUrl, {
      foreignKey: 'feed_url_id',
      as: 'feedUrl',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return ClientDetail;
};
