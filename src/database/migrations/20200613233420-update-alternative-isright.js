'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'alternatives',
      'isright',
     Sequelize.BOOLEAN
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'alternatives',
      'isright'
    );
  }
};
