'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('feed_urls', 'device', {
      type: Sequelize.SMALLINT,
      allowNull: false,
      defaultValue: 2,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('feed_urls', 'device');
  }
};