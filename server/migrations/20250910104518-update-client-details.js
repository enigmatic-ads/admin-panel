'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('client_details', 'url_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });

    await queryInterface.addColumn('client_details', 'feed_url_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'feed_urls',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('client_details', 'feed_url_id');

    await queryInterface.changeColumn('client_details', 'url_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};