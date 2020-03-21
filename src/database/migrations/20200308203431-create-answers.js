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
        description: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        votes: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        pollId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'polls',
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
