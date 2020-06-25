import { gql, PubSub } from 'apollo-server-express';
import { graphql, subscribe, parse } from 'graphql';

import schema from '../../../src/graphql/schema';
import config from '../../config-sequelize';
import { createFakePoll } from '../utils/pollBuilder';
import { tester, context } from '../utils/tester';
import { getFakeUser } from '../utils/userBuilder';

config();

describe('Test Poll Subscriptions', () => {
  test('should validate invite subscription', async () => {
    const pollSubscription = gql`
      subscription {
        invited {
          id
          title
        }
      }
    `;

    tester.test(true, pollSubscription);
  });

  test('should subscribe to invites', async () => {
    const poll = await createFakePoll();
    const userToInvite = getFakeUser();

    const newContext = {
      ...context,
      pubSub: new PubSub(),
      userId: poll.userId
    };

    const mutation = `
      mutation POLL_MUTATION($invites: [InputInvite]!) {
        addInvites(invites: $invites)
      }
    `;

    const variablesMutation = {
      invites: [{ pollsetId: poll.id, email: userToInvite.email }]
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

    const result = await subscribe(
      schema,
      parse(subscription),
      triggerSubscription,
      newContext
    );

    const resultData = await result.next();

    const expected = {
      invited: {
        id: poll.id.toString(),
        title: poll.title
      }
    };

    expect(resultData.value.data).toEqual(expected);
  });
});
