import { gql, PubSub } from 'apollo-server-express';
import { GraphQLError } from 'graphql';

import config from '../../config-sequelize';
import { createFakePoll } from '../utils/pollBuilder';
import { tester, context } from '../utils/tester';
import { getFakeUser } from '../utils/userBuilder';

config();

describe('Test Poll Mutations', () => {
  test('should throw an error if invite to a poll I didnt created ', async () => {
    const poll = await createFakePoll();
    const userToInvite = getFakeUser();

    const pollQuery = gql`
      mutation POLL_MUTATION($invites: [InputInvite]!) {
        addInvites(invites: $invites)
      }
    `;

    const expected = {
      data: {
        addInvites: null
      },
      errors: [new GraphQLError('Not authorized.')]
    };

    const result = await tester.graphql(
      pollQuery,
      undefined,
      { ...context, userId: poll.userId + 1 },
      {
        invites: [{ pollsetId: poll.id, email: userToInvite.email }]
      }
    );
    expect(result).toEqual(expected);
  });

  test('should add an invite', async () => {
    const poll = await createFakePoll();
    const userToInvite = getFakeUser();

    const pollQuery = gql`
      mutation POLL_MUTATION($invites: [InputInvite]!) {
        addInvites(invites: $invites)
      }
    `;

    const expected = {
      data: {
        addInvites: true
      }
    };

    const result = await tester.graphql(
      pollQuery,
      undefined,
      { ...context, pubSub: new PubSub(), userId: poll.userId },
      {
        invites: [{ pollsetId: poll.id, email: userToInvite.email }]
      }
    );
    expect(result).toEqual(expected);
  });
});
