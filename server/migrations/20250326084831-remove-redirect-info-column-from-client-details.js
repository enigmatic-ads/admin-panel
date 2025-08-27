'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("client_details", "redirect_info");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("client_details", "redirect_info", {
      type: Sequelize.STRING(200),
      allowNull: true,
    });
  }
};
