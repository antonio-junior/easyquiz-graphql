module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      'polls',
      [
        {
          title: 'a pergunta',
          uuid: '123456',
          status: 'ACTIVE',
          partial: true,
          allowpublic: true,
          multiple: true,
          expiration: null,
          userId: 6,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    ),

  down: queryInterface => queryInterface.bulkDelete('polls', null, {})
};
