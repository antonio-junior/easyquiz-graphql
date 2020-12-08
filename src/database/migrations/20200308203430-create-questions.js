module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'questions',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        query: {
          type: Sequelize.STRING,
          allowNull: false,
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable('questions'),
};
