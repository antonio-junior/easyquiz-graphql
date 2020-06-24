import { gql, PubSub } from 'apollo-server-express';
import faker from 'faker';
import { GraphQLError } from 'graphql';

import { PollSet } from '../../../src/models';
import config from '../../config-sequelize';
import { createFakePoll, getFakePoll } from '../utils/pollBuilder';
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

  test('should add answers', async () => {
    const alternatives = {
      polls: [
        {
          alternatives: [
            { description: faker.lorem.sentence(3), isright: false },
            { description: faker.lorem.sentence(3), isright: false },
            { description: faker.lorem.sentence(4), isright: false }
          ]
        }
      ]
    };
    const pollSet = await createFakePoll(alternatives);

    const pollQuery = gql`
      mutation POLL_MUTATION($answers: [AnswerInput]!) {
        addAnswer(answers: $answers)
      }
    `;

    const expected = {
      data: {
        addAnswer: true
      }
    };

    const email = faker.internet.email();
    const email2 = faker.internet.email();
    const result = await tester.graphql(pollQuery, undefined, undefined, {
      answers: [
        { alternativeId: pollSet.polls[0].alternatives[1].id, email },
        { alternativeId: pollSet.polls[0].alternatives[0].id, email },
        { alternativeId: pollSet.polls[0].alternatives[1].id, email: email2 },
        { alternativeId: pollSet.polls[0].alternatives[0].id, email: email2 },
        { alternativeId: pollSet.polls[0].alternatives[2].id, email: email2 }
      ]
    });
    expect(result).toEqual(expected);

    const updatedPollSet = await PollSet.findByPk(pollSet.id);

    expect(updatedPollSet.userAnswers).toEqual(2);
  });

  test('should add a PollSet', async () => {
    const pollData = await getFakePoll({
      expiration: '14-06-2022 16:40'
    });

    const pollQuery = gql`
      mutation POLL_MUTATION(
        $title: String!
        $ispublic: Boolean!
        $showpartial: Boolean!
        $isquiz: Boolean!
        $expiration: String
        $polls: [PollInput]!
      ) {
        addPoll(
          title: $title
          ispublic: $ispublic
          showpartial: $showpartial
          isquiz: $isquiz
          expiration: $expiration
          polls: $polls
        ) {
          title
          dtExpiration
        }
      }
    `;

    const expected = {
      data: {
        addPoll: {
          title: pollData.title,
          dtExpiration: '14/06/2022 16:40'
        }
      }
    };

    const result = await tester.graphql(
      pollQuery,
      undefined,
      { ...context, userId: pollData.userId },
      {
        title: pollData.title,
        ispublic: pollData.ispublic,
        showpartial: pollData.showpartial,
        isquiz: pollData.isquiz,
        expiration: pollData.expiration,
        polls: pollData.polls
      }
    );
    expect(result).toEqual(expected);
  });

  test('should throw an error if a quiz has a question with no right alternative', async () => {
    const alternatives = {
      polls: [
        {
          alternatives: [
            { description: faker.lorem.sentence(3), isright: false },
            { description: faker.lorem.sentence(4), isright: false }
          ]
        }
      ]
    };

    const pollData = await getFakePoll(alternatives);

    const pollQuery = gql`
      mutation POLL_MUTATION(
        $title: String!
        $ispublic: Boolean!
        $showpartial: Boolean!
        $isquiz: Boolean!
        $expiration: String
        $polls: [PollInput]!
      ) {
        addPoll(
          title: $title
          ispublic: $ispublic
          showpartial: $showpartial
          isquiz: $isquiz
          expiration: $expiration
          polls: $polls
        ) {
          title
        }
      }
    `;

    const expected = {
      data: {
        addPoll: null
      },
      errors: [
        new GraphQLError(
          `'${pollData.polls[0].question}' should have at least one right Alternative`
        )
      ]
    };

    const result = await tester.graphql(
      pollQuery,
      undefined,
      { ...context, userId: pollData.userId },
      {
        title: pollData.title,
        ispublic: pollData.ispublic,
        showpartial: pollData.showpartial,
        isquiz: pollData.isquiz,
        expiration: pollData.expiration,
        polls: pollData.polls
      }
    );
    expect(result).toEqual(expected);
  });
});
