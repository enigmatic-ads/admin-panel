'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('redirect_urls', 'source', {
      type: Sequelize.STRING(30),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('redirect_urls', 'source');
  },
};