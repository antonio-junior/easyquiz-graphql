module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'answers',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        questionId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'questions',
            },
            key: 'id'
          },
          allowNull: false
        },
        resultId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'results',
            },
            key: 'id'
          },
          allowNull: false
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      {
        charset: 'utf8',
      },
    ),

  down: (queryInterface, _Sequelize) => queryInterface.dropTable('answers'),
};
