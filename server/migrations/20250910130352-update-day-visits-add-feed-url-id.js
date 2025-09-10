'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('day_visits', 'feed_url_id', {
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
    await queryInterface.removeColumn('day_visits', 'feed_url_id');
  },
};
