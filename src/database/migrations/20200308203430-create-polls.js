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
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        uuid: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        partial: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        allowpublic: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        multiple: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
        },
        expiration: {
          type: Sequelize.DATE,
          allowNull: true,
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
