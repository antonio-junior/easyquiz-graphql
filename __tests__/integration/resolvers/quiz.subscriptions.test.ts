import { gql, PubSub } from 'apollo-server-express';
import { graphql, subscribe, parse } from 'graphql';
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
      subscription {
        invited {
          id
          title
        }
      }
    `;

    tester.test(true, querySubscription);
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
          quizId
        }
      }
    `;

    const variablesMutation = {
      quizId: quiz.id,
      email: userToInvite.email
    };

    const subscription = `
      subscription {
        invited {
          id
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
      newContext
    )) as AsyncIterableIterator<ExecutionResult<ExecutionResultDataDefault>>;

    const resultData = await result.next();

    const expected = {
      invited: {
        id: quiz.id.toString(),
        title: quiz.title
      }
    };

    expect(resultData.value.data).toEqual(expected);
  });
});
