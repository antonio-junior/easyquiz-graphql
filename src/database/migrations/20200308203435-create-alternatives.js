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
          type: Sequelize.BOOLEAN,
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
