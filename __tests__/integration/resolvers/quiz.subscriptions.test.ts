import { gql } from 'apollo-server-express';
import { graphql, subscribe, parse } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { ExecutionResult } from 'graphql-tools';
import { ExecutionResultDataDefault } from 'graphql/execution/execute';

import schema from '../../../src/graphql/schema';
import config from '../../config-sequelize';
import { createFakeQuiz } from '../utils/quizBuilder';
import { tester, context } from '../utils/tester';
import { getFakeUser } from '../utils/userBuilder';

config();

describe('Test Query Subscriptions', () => {
  test('should validate invite subscription', async () => {
    const querySubscription = gql`
      subscription INVITE_SUBSCRIPTION($email: String!) {
        invited(email: $email) {
          id
          title
        }
      }
    `;

    tester.test(true, querySubscription, {
      email: getFakeUser().email
    });
  });

  test('should subscribe to invites', async () => {
    const quiz = await createFakeQuiz();
    const userToInvite = getFakeUser();

    const newContext = {
      ...context,
      pubSub: new PubSub(),
      userId: quiz.userId
    };

    const mutation = `
      mutation QUIZ_MUTATION($quizId: ID!, $email: String!) {
        addInvite(quizId: $quizId, email: $email) {
          title
        }
      }
    `;

    const variablesMutation = {
      quizId: quiz.id,
      email: userToInvite.email
    };

    const subscription = `
      subscription INVITE_SUBSCRIPTION($email: String!){
        invited (email: $email){
          title
        }
      }
    `;

    const triggerSubscription = graphql(
      schema,
      mutation,
      undefined,
      newContext,
      variablesMutation
    );

    const result = (await subscribe(
      schema,
      parse(subscription),
      triggerSubscription,
      newContext,
      { email: userToInvite.email }
    )) as AsyncIterableIterator<ExecutionResult<ExecutionResultDataDefault>>;

    const resultData = await result.next();

    const expected = {
      invited: {
        title: quiz.title
      }
    };

    expect(resultData.value.data).toEqual(expected);
  });
});
