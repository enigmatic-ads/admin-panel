'use strict';

module.exports = (sequelize, DataTypes) => {
  const DayVisit = sequelize.define(
    'DayVisit',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      url_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'RedirectUrl',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      client_ip: {
        type: DataTypes.STRING(20),
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
      tableName: 'day_visits',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['url_id', 'client_ip'],
        },
      ],
    }
  );

  DayVisit.associate = (models) => {
    DayVisit.belongsTo(models.RedirectUrl, {
      foreignKey: 'url_id',
      as: 'redirectUrl',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return DayVisit;
};
