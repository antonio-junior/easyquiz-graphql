import { gql } from 'apollo-server-express';
import faker from 'faker';
import { GraphQLError } from 'graphql';

import { Invite, User, Quiz, Result } from '../../../src/models';
import config from '../../config-sequelize';
import { createFakeQuiz } from '../utils/quizBuilder';
import { tester, context } from '../utils/tester';
import { createFakeUser, getFakeUser } from '../utils/userBuilder';

config();

describe('Test Quiz Queries', () => {
  test('should return a public quiz', async () => {
    const quiz = await createFakeQuiz();

    const quizQuery = gql`
      query QUIZ_QUERY($id: ID!) {
        quiz(id: $id) {
          title
          owner {
            name
          }
        }
      }
    `;

    const owner = await User.findByPk(quiz.userId, {
      rejectOnEmpty: false
    });

    const expected = {
      data: {
        quiz: {
          title: quiz.title,
          owner: {
            name: owner.name
          }
        }
      }
    };

    const result = await tester.graphql(
      quizQuery,
      undefined,
      { ...context, email: faker.internet.email() },
      {
        id: quiz.id
      }
    );
    expect(result).toEqual(expected);
  });

  test('should return a private quiz with invite', async () => {
    const privateQuiz = await createFakeQuiz({ isPublic: false });

    const fakeUser = getFakeUser();

    await Invite.create({ email: fakeUser.email, quizId: privateQuiz.id });
    const quizQuery = gql`
      query quiz_QUERY($id: ID!) {
        quiz(id: $id) {
          title
          owner {
            name
          }
        }
      }
    `;

    const owner = await User.findByPk(privateQuiz.userId, {
      rejectOnEmpty: false
    });

    const expected = {
      data: {
        quiz: {
          title: privateQuiz.title,
          owner: {
            name: owner.name
          }
        }
      }
    };

    const result = await tester.graphql(
      quizQuery,
      undefined,
      { ...context, email: fakeUser.email },
      {
        id: privateQuiz.id
      }
    );
    expect(result).toEqual(expected);
  });

  test('private quiz should return an error if no invite is added', async () => {
    const privateQuiz = await createFakeQuiz({ isPublic: false });

    const fakeUser = getFakeUser();

    const questionQuery = gql`
      query question_QUERY($id: ID!) {
        quiz(id: $id) {
          title
          owner {
            name
          }
        }
      }
    `;

    const expected = {
      data: {
        quiz: null
      },
      errors: [new GraphQLError('Not Authorized')]
    };

    const result = await tester.graphql(
      questionQuery,
      undefined,
      { ...context, email: fakeUser.email },
      {
        id: privateQuiz.id
      }
    );
    expect(result).toEqual(expected);
  });

  test('should return only public quizes', async () => {
    await createFakeQuiz({ isPublic: true });
    await createFakeQuiz({ isPublic: false });
    await createFakeQuiz({ isPublic: true });

    const allPublic = await Quiz.findAll({ where: { isPublic: true } });

    const allPublicTitle = allPublic.map(({ title }) => {
      return { title };
    });

    const questionQuery = gql`
      query question_QUERY {
        publicQuizes {
          title
        }
      }
    `;

    const expected = {
      data: {
        publicQuizes: allPublicTitle
      }
    };

    const result = await tester.graphql(questionQuery, undefined, context);
    expect(result).toEqual(expected);
  });

  test('should throw an error if there isnt userId in context', async () => {
    const questionQuery = gql`
      query question_QUERY {
        myQuizes {
          title
          owner {
            name
          }
        }
      }
    `;

    const expected = {
      data: {
        myQuizes: null
      },
      errors: [new GraphQLError('Must be authenticated.')]
    };

    const result = await tester.graphql(questionQuery, undefined, context);

    expect(result).toEqual(expected);
  });

  test('should return quizes created by me', async () => {
    const quiz = await createFakeQuiz();

    const quizQuery = gql`
      query question_QUERY {
        myQuizes {
          title
          owner {
            name
          }
        }
      }
    `;

    const owner = await User.findByPk(quiz.userId, {
      rejectOnEmpty: false
    });

    const expected = {
      data: {
        myQuizes: [
          {
            title: quiz.title,
            owner: {
              name: owner.name
            }
          }
        ]
      }
    };

    const result = await tester.graphql(quizQuery, undefined, {
      ...context,
      userId: quiz.userId
    });

    expect(result).toEqual(expected);
  });

  test('should return quizes available to answer (public and invited)', async () => {
    const quiz = await createFakeQuiz({ isPublic: false });
    const owner = await User.findByPk(quiz.userId, {
      rejectOnEmpty: false
    });
    await Invite.create({ email: owner.email, quizId: quiz.id });

    const allPublic = await Quiz.findAll({ where: { isPublic: true } });

    const allPublicTitle = allPublic.map(({ title }) => {
      return { title };
    });

    const quizQuery = gql`
      query quiz_QUERY {
        availableToAnswer {
          title
        }
      }
    `;

    const expected = {
      data: {
        availableToAnswer: [...allPublicTitle, { title: quiz.title }]
      }
    };

    const result = await tester.graphql(quizQuery, undefined, {
      ...context,
      userId: quiz.userId,
      email: owner.email
    });

    expect(result).toEqual(expected);
  });

  test('should return quizes that I answered', async () => {
    const quiz = await createFakeQuiz();
    const userToVote = await createFakeUser();

    await Result.create({
      userId: userToVote.id,
      quizId: quiz.id,
      answers: [
        {
          questionId: quiz.questions[0].id,
          alternatives: [quiz.questions[0].alternatives[0].id]
        }
      ]
    });

    const questionQuery = gql`
      query question_QUERY {
        answeredQuizes {
          title
        }
      }
    `;

    const expected = {
      data: {
        answeredQuizes: [
          {
            title: quiz.title
          }
        ]
      }
    };

    const result = await tester.graphql(questionQuery, undefined, {
      ...context,
      userId: userToVote.id,
      email: userToVote.email
    });

    expect(result).toEqual(expected);
  });
});
