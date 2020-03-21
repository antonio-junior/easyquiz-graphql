module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      'users',
      [
        {
          name: 'John Doe',
          email: 'test9@medium.com',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'John Travolta',
          email: 'test10@medium.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      {}
    ),

  down: queryInterface => queryInterface.bulkDelete('users', null, {})
};
