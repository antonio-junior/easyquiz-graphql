module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      'answers',
      [
        {
          description: 'resposta 1',
          votes: 1,
          pollId: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          description: 'resposta 2',
          votes: 3,
          pollId: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    ),

  down: queryInterface => queryInterface.bulkDelete('answers', null, {})
};
