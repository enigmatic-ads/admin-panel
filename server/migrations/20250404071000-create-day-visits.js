'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("day_visits", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      url_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'redirect_urls',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      client_ip: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    }, {
      indexes: [
        {
          unique: true,
          fields: ['url_id', 'client_ip']
        }
      ]
    });
  },

  async down (queryInterface) {
    await queryInterface.dropTable("day_visits");
  }
};
