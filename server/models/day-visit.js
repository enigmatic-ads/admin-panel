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
      campaign_id: {
        type: DataTypes.STRING(30),
        allowNull: true,
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
          fields: ['campaign_id', 'client_ip'],
        },
      ],
    }
  );

  return DayVisit;
};