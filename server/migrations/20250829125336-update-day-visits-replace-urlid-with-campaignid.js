'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('day_visits', 'url_id');

    await queryInterface.addColumn('day_visits', 'campaign_id', {
      type: Sequelize.STRING(30),
      allowNull: true,
    });

    await queryInterface.addConstraint('day_visits', {
      fields: ['campaign_id', 'client_ip'],
      type: 'unique',
      name: 'day_visits_campaign_ip_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('day_visits', 'campaign_id');

    await queryInterface.addColumn('day_visits', 'url_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'redirect_urls',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('day_visits', {
      fields: ['url_id', 'client_ip'],
      type: 'unique',
      name: 'day_visits_url_ip_unique'
    });
  }
};