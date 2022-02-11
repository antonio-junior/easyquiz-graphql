module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'alternatives',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        text: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        isRight: {
          type: Sequelize.INTEGER,
          allowNull: true,
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
        answerId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'answers',
            },
            key: 'id'
          },
          allowNull: true
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable('alternatives'),
};
