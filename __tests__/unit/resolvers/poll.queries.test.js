import { gql } from 'apollo-server-express';
import faker from 'faker';
import { GraphQLError } from 'graphql';

import { Invite, User, PollSet, Answer } from '../../../src/models';
import config from '../../config-sequelize';
import { createFakePoll } from '../utils/pollBuilder';
import { tester, context } from '../utils/tester';
import { createFakeUser, getFakeUser } from '../utils/userBuilder';

config();

describe('Test Poll Queries', () => {
  test('should return a public poll', async () => {
    const poll = await createFakePoll();

    const pollQuery = gql`
      query POLL_QUERY($id: ID!) {
        poll(id: $id) {
          title
          owner {
            name
          }
        }
      }
    `;

    const owner = await User.findByPk(poll.userId);

    const expected = {
      data: {
        poll: {
          title: poll.title,
          owner: {
            name: owner.name
          }
        }
      }
    };

    const result = await tester.graphql(
      pollQuery,
      undefined,
      { ...context, email: faker.internet.email() },
      {
        id: poll.id
      }
    );
    expect(result).toEqual(expected);
  });

  test('should return a private poll with invite', async () => {
    const poll = await createFakePoll({ ispublic: false });

    const fakeUser = getFakeUser();

    await Invite.create({ email: fakeUser.email, pollsetId: poll.id });
    const pollQuery = gql`
      query POLL_QUERY($id: ID!) {
        poll(id: $id) {
          title
          owner {
            name
          }
        }
      }
    `;

    const owner = await User.findByPk(poll.userId);

    const expected = {
      data: {
        poll: {
          title: poll.title,
          owner: {
            name: owner.name
          }
        }
      }
    };

    const result = await tester.graphql(
      pollQuery,
      undefined,
      { ...context, email: fakeUser.email },
      {
        id: poll.id
      }
    );
    expect(result).toEqual(expected);
  });

  test('private poll should return an error if no invite is added', async () => {
    const poll = await createFakePoll({ ispublic: false });

    const fakeUser = getFakeUser();

    const pollQuery = gql`
      query POLL_QUERY($id: ID!) {
        poll(id: $id) {
          title
          owner {
            name
          }
        }
      }
    `;

    const expected = {
      data: {
        poll: null
      },
      errors: [new GraphQLError('Not Authorized')]
    };

    const result = await tester.graphql(
      pollQuery,
      undefined,
      { ...context, email: fakeUser.email },
      {
        id: poll.id
      }
    );
    expect(result).toEqual(expected);
  });

  test('should return only public polls', async () => {
    await createFakePoll({ ispublic: true });
    await createFakePoll({ ispublic: false });
    await createFakePoll({ ispublic: true });

    const allPublic = await PollSet.findAll(
      { where: { ispublic: true } },
      { raw: true }
    );

    const allPublicTitle = allPublic.map(({ title }) => {
      return { title };
    });

    const pollQuery = gql`
      query POLL_QUERY {
        publicPollSets {
          title
        }
      }
    `;

    const expected = {
      data: {
        publicPollSets: allPublicTitle
      }
    };

    const result = await tester.graphql(pollQuery, undefined, context);
    expect(result).toEqual(expected);
  });

  test('should throw an error if there isnt userId in context', async () => {
    const pollQuery = gql`
      query POLL_QUERY {
        myPollSets {
          title
          owner {
            name
          }
        }
      }
    `;

    const expected = {
      data: {
        myPollSets: null
      },
      errors: [new GraphQLError('Must be authenticated.')]
    };

    const result = await tester.graphql(pollQuery, undefined, context);

    expect(result).toEqual(expected);
  });

  test('should return polls created by me', async () => {
    const poll = await createFakePoll();

    const pollQuery = gql`
      query POLL_QUERY {
        myPollSets {
          title
          owner {
            name
          }
        }
      }
    `;

    const owner = await User.findByPk(poll.userId);

    const expected = {
      data: {
        myPollSets: [
          {
            title: poll.title,
            owner: {
              name: owner.name
            }
          }
        ]
      }
    };

    const result = await tester.graphql(pollQuery, undefined, {
      ...context,
      userId: poll.userId
    });

    expect(result).toEqual(expected);
  });

  test('should return polls available to answer (public and invited)', async () => {
    const poll = await createFakePoll({ ispublic: false });
    const owner = await User.findByPk(poll.userId);
    await Invite.create({ email: owner.email, pollsetId: poll.id });

    const allPublic = await PollSet.findAll(
      { where: { ispublic: true } },
      { raw: true }
    );

    const allPublicTitle = allPublic.map(({ title }) => {
      return { title };
    });

    const pollQuery = gql`
      query POLL_QUERY {
        availableToAnswer {
          title
        }
      }
    `;

    const expected = {
      data: {
        availableToAnswer: [...allPublicTitle, { title: poll.title }]
      }
    };

    const result = await tester.graphql(pollQuery, undefined, {
      ...context,
      userId: poll.userId,
      email: owner.email
    });

    expect(result).toEqual(expected);
  });

  test('should return polls that I voted', async () => {
    const pollSet = await createFakePoll();
    const userToVote = await createFakeUser();

    await Answer.create({
      email: userToVote.email,
      alternativeId: pollSet.polls[0].alternatives[0].id
    });

    const pollQuery = gql`
      query POLL_QUERY {
        votedPollSets {
          title
        }
      }
    `;

    const expected = {
      data: {
        votedPollSets: [
          {
            title: pollSet.title
          }
        ]
      }
    };

    const result = await tester.graphql(pollQuery, undefined, {
      ...context,
      userId: userToVote.id,
      email: userToVote.email
    });

    expect(result).toEqual(expected);
  });
});
