import { gql } from 'apollo-server-express';
import faker from 'faker';

import config from '../../config-sequelize';
import GraphQLError from '../utils/GraphQLError';
import { tester, context } from '../utils/tester';
import { createFakeUser, getFakeUser } from '../utils/userBuilder';

config();

describe.only('Test user operations', () => {
  test('user should login', async () => {
    const user = await createFakeUser();
    const loginMutation = gql`
      mutation LOGIN_MUTATION($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          name
        }
      }
    `;

    const expected = {
      data: {
        login: {
          name: user.name
        }
      }
    };

    const result = await tester.graphql(loginMutation, undefined, context, {
      email: user.email,
      password: user.password
    });
    expect(result).toEqual(expected);
  });

  test('user should logout', async () => {
    const logoutMutation = gql`
      mutation LOGOUT_MUTATION {
        logout
      }
    `;

    const expected = {
      data: {
        logout: true
      }
    };

    const result = await tester.graphql(logoutMutation, undefined, context);
    expect(result).toEqual(expected);
  });

  test('should create a user', async () => {
    const newUser = getFakeUser();

    const addUserMutation = gql`
      mutation ADDUSER_MUTATION(
        $name: String!
        $email: String!
        $password: String!
      ) {
        addUser(name: $name, email: $email, password: $password) {
          name
          email
        }
      }
    `;

    const expected = {
      data: {
        addUser: {
          name: newUser.name,
          email: newUser.email
        }
      }
    };

    const result = await tester.graphql(
      addUserMutation,
      undefined,
      context,
      newUser
    );
    expect(result).toEqual(expected);
  });

  test('user should not login with an unregistered email', async () => {
    const loginMutation = gql`
      mutation LOGIN_MUTATION($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          name
        }
      }
    `;

    const expected = {
      data: {
        login: null
      },
      errors: [new GraphQLError('Email does not exist')]
    };

    const result = await tester.graphql(loginMutation, undefined, context, {
      email: faker.internet.email(),
      password: faker.internet.password(6)
    });
    expect(result).toEqual(expected);
  });

  test('user should not login with invalid password', async () => {
    const user = await createFakeUser();
    const loginMutation = gql`
      mutation LOGIN_MUTATION($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          name
        }
      }
    `;

    const expected = {
      data: {
        login: null
      },
      errors: [new GraphQLError('Password incorrect')]
    };

    const result = await tester.graphql(loginMutation, undefined, context, {
      email: user.email,
      password: faker.internet.password(6)
    });
    expect(result).toEqual(expected);
  });

  test('should not create a user with email that already exists', async () => {
    const user = await createFakeUser();
    const addUserMutation = gql`
      mutation ADDUSER_MUTATION(
        $name: String!
        $email: String!
        $password: String!
      ) {
        addUser(name: $name, email: $email, password: $password) {
          name
        }
      }
    `;

    const expected = {
      data: {
        addUser: null
      },
      errors: [new Error('Email already in use')]
    };

    const result = await tester.graphql(addUserMutation, undefined, context, {
      email: user.email,
      password: faker.internet.password(6),
      name: user.name
    });
    expect(result).toEqual(expected);
  });
});
