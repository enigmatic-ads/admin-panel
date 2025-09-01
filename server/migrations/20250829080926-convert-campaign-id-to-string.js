'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('redirect_urls', 'campaign_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('redirect_urls', 'campaign_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }
};