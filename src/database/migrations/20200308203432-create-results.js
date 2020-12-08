module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'results',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'users',
            },
            key: 'id'
          },
          allowNull: false
        },
        quizId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'quizes',
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable('results'),
};
