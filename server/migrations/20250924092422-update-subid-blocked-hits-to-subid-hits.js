'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('subid_blocked_hits', 'subid_hits');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('subid_hits', 'subid_blocked_hits');
  },
};