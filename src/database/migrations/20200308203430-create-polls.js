module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.createTable(
      'polls',
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        question: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        maxselections: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        pollSetId: {
          type: Sequelize.INTEGER,
          references: {
            model: {
              tableName: 'pollsets',
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

  down: (queryInterface, _Sequelize) => queryInterface.dropTable('polls'),
};
