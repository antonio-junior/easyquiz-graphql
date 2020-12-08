import { gql, PubSub } from 'apollo-server-express';
import faker from 'faker';
import { GraphQLError } from 'graphql';

import { Answer, Result } from '../../../src/models';
import config from '../../config-sequelize';
import { createFakeQuiz, getFakeQuiz } from '../utils/quizBuilder';
import { tester, context } from '../utils/tester';
import { createFakeUser, getFakeUser } from '../utils/userBuilder';

config();

describe('Test Quiz Mutations', () => {
  test('should throw an error if I invite someone to a quiz I didnt created ', async () => {
    const quiz = await createFakeQuiz();
    const userToInvite = getFakeUser();

    const quizQuery = gql`
      mutation QUIZ_MUTATION($quizId: ID!, $email: String!) {
        addInvite(quizId: $quizId, email: $email) {
          quizId
        }
      }
    `;

    const expected = {
      data: {
        addInvite: null
      },
      errors: [new GraphQLError('Not authorized.')]
    };

    const result = await tester.graphql(
      quizQuery,
      undefined,
      { ...context, userId: quiz.userId + 1 },
      {
        quizId: quiz.id,
        email: userToInvite.email
      }
    );
    expect(result).toEqual(expected);
  });

  test('should add an invite', async () => {
    const quiz = await createFakeQuiz();
    const userToInvite = getFakeUser();

    const quizQuery = gql`
      mutation QUIZ_MUTATION($quizId: ID!, $email: String!) {
        addInvite(quizId: $quizId, email: $email) {
          quizId
        }
      }
    `;

    const expected = {
      data: {
        addInvite: {
          quizId: quiz.id.toString()
        }
      }
    };

    const result = await tester.graphql(
      quizQuery,
      undefined,
      { ...context, pubSub: new PubSub(), userId: quiz.userId },
      {
        quizId: quiz.id,
        email: userToInvite.email
      }
    );
    expect(result).toEqual(expected);
  });

  test('should add a result', async () => {
    const userToAddResult = await createFakeUser();
    const alternatives = {
      questions: [
        {
          alternatives: [
            { text: faker.lorem.sentence(3), isRight: false },
            { text: faker.lorem.sentence(3), isRight: true },
            { text: faker.lorem.sentence(4), isRight: false }
          ]
        }
      ]
    };
    const quiz = await createFakeQuiz(alternatives);

    const quizQuery = gql`
      mutation POLL_MUTATION($quizId: ID!, $answers: [AnswerInput]!) {
        addResult(quizId: $quizId, answers: $answers) {
          quiz {
            id
          }
        }
      }
    `;

    const expected = {
      data: {
        addResult: {
          quiz: {
            id: quiz.id.toString()
          }
        }
      }
    };

    const result = await tester.graphql(
      quizQuery,
      undefined,
      { ...context, userId: userToAddResult.id },
      {
        quizId: quiz.id,
        answers: [
          {
            questionId: quiz.questions[0].id,
            alternatives: [quiz.questions[0].alternatives[0].id]
          }
        ]
      }
    );
    expect(result).toEqual(expected);
  });

  test('should throw an error if user already answered the quiz', async () => {
    const userToAddResult = await createFakeUser();
    const alternatives = {
      questions: [
        {
          alternatives: [
            { text: faker.lorem.sentence(3), isRight: false },
            { text: faker.lorem.sentence(3), isRight: true },
            { text: faker.lorem.sentence(4), isRight: false }
          ]
        }
      ]
    };
    const quiz = await createFakeQuiz(alternatives);
    const alternativesToResult = [
      // eslint-disable-next-line radix
      parseInt(quiz.questions[0].alternatives[0].id)
    ];
    await Result.create(
      {
        userId: userToAddResult.id,
        quizId: quiz.id,
        answers: [
          {
            questionId: quiz.questions[0].id,
            alternatives: alternativesToResult
          }
        ]
      },
      {
        include: [Answer]
      }
    );

    const quizQuery = gql`
      mutation POLL_MUTATION($quizId: ID!, $answers: [AnswerInput]!) {
        addResult(quizId: $quizId, answers: $answers) {
          quiz {
            id
          }
        }
      }
    `;

    const expected = {
      data: {
        addResult: null
      },
      errors: [new GraphQLError('User already answered')]
    };

    const result = await tester.graphql(
      quizQuery,
      undefined,
      { ...context, userId: userToAddResult.id },
      {
        quizId: quiz.id,
        answers: [
          {
            questionId: quiz.questions[0].id,
            alternatives: [quiz.questions[0].alternatives[0].id]
          }
        ]
      }
    );
    expect(result).toEqual(expected);
  });

  test('should add a Quiz', async () => {
    const quizData = await getFakeQuiz({
      expiration: '14-06-2022 16:40'
    });

    const quizQuery = gql`
      mutation QUIZ_MUTATION(
        $title: String!
        $isPublic: Boolean!
        $showPartial: Boolean!
        $expiration: String
        $questions: [QuestionInput]!
      ) {
        addQuiz(
          title: $title
          isPublic: $isPublic
          showPartial: $showPartial
          expiration: $expiration
          questions: $questions
        ) {
          title
          dtExpiration
        }
      }
    `;

    const expected = {
      data: {
        addQuiz: {
          title: quizData.title,
          dtExpiration: '14/06/2022 16:40'
        }
      }
    };

    const result = await tester.graphql(
      quizQuery,
      undefined,
      { ...context, userId: quizData.userId },
      {
        title: quizData.title,
        isPublic: quizData.isPublic,
        showPartial: quizData.showPartial,
        expiration: quizData.expiration,
        questions: quizData.questions
      }
    );
    expect(result).toEqual(expected);
  });

  test('should throw an error if a quiz has a question with no right alternative', async () => {
    const alternatives = {
      questions: [
        {
          alternatives: [
            { text: faker.lorem.sentence(3), isRight: false },
            { text: faker.lorem.sentence(4), isRight: false }
          ]
        }
      ]
    };

    const quizData = await getFakeQuiz(alternatives);

    const pollQuery = gql`
      mutation POLL_MUTATION(
        $title: String!
        $isPublic: Boolean!
        $showPartial: Boolean!
        $expiration: String
        $questions: [QuestionInput]!
      ) {
        addQuiz(
          title: $title
          isPublic: $isPublic
          showPartial: $showPartial
          expiration: $expiration
          questions: $questions
        ) {
          title
        }
      }
    `;

    const expected = {
      data: {
        addQuiz: null
      },
      errors: [
        new GraphQLError(
          `Question '${quizData.questions[0].query}' should have at least one right Alternative`
        )
      ]
    };

    const result = await tester.graphql(
      pollQuery,
      undefined,
      { ...context, userId: quizData.userId },
      {
        title: quizData.title,
        isPublic: quizData.isPublic,
        showPartial: quizData.showPartial,
        expiration: quizData.expiration,
        questions: quizData.questions
      }
    );
    expect(result).toEqual(expected);
  });
});
