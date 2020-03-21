module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'votes',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        byMail: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        byIP: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        answerId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'answers',
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable('votes'),
};
