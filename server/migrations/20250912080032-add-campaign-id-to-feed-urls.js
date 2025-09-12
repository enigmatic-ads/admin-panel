'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('feed_urls', 'campaign_id', {
      type: Sequelize.STRING(20),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('feed_urls', 'campaign_id');
  }
};