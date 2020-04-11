import { poll, polls } from '../../../src/graphql/resolvers/queries';
import { User, Poll, PollSet } from '../../../src/models';
import config from '../../config-sequelize';

config();

let userId;

test('resolver should return a poll', async () => {
  const user = await User.create({ name: 'roger', email: 'roger@gmail.com' });
  userId = user.get('id');

  const createdPoll = await PollSet.create(
    {
      title: 'New Poll',
      uuid: '',
      status: PollSet.Status.ACTIVE,
      allowpublic: true,
      partial: true,
      userId,
      polls: [
        {
          question: 'the question',
          maxselections: 1,
          alternatives: [
            { description: 'alternative 1' },
            { description: 'alternative 2' }
          ]
        }
      ]
    },
    {
      include: [Poll]
    }
  );

  const returnedPoll = await poll(null, { id: createdPoll.get('id') });

  expect(returnedPoll.get('title')).toBe(createdPoll.get('title'));
});

test('resolver should return all user polls', async () => {
  await PollSet.create(
    {
      title: 'New Poll',
      uuid: '',
      status: PollSet.Status.ACTIVE,
      allowpublic: true,
      partial: true,
      userId,
      polls: [
        {
          question: 'the question',
          maxselections: 1,
          alternatives: [
            { description: 'alternative 1' },
            { description: 'alternative 2' }
          ]
        }
      ]
    },
    {
      include: [Poll]
    }
  );

  const userPolls = await polls(null, { userId });

  expect(userPolls.length).toBe(2);
});
