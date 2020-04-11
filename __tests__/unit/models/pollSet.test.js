import { Poll, PollSet, User, Answer } from '../../../src/models';
import config from '../../config-sequelize';

config();

const email = 'charles@gmail.com';
let pollSetId = 0;

test('should create a poll', async () => {
  const name = 'tony';

  const user = await User.create({ name, email });

  const pollSet = await PollSet.create(
    {
      title: 'New Poll',
      uuid: '',
      status: PollSet.Status.ACTIVE,
      allowpublic: true,
      partial: true,
      userId: user.get('id'),
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

  pollSetId = pollSet.get('id');
  expect(pollSet.getDataValue('title')).toBe('New Poll');
  expect(pollSet.getDataValue('allowpublic')).toBe(true);

  const polls = pollSet.getDataValue('polls');

  expect(polls.length).toBe(1);
  expect(polls[0].getDataValue('alternatives').length).toBe(2);
});

test('User should have one poll', async () => {
  const user = await User.findOne({ where: { email } });
  expect((await user.$get('pollSets')).length).toBe(1);
});

test('Poll should belongs to an user', async () => {
  const pollSet = await PollSet.findOne({ where: { id: pollSetId } });
  expect(pollSet.get('userId')).toBeTruthy();
});

test('Poll should return expiration date in a friendly format', async () => {
  await PollSet.update(
    { expiration: new Date(2030, 5, 1, 10, 0) },
    { where: { id: pollSetId } }
  );

  const updatedPollSet = await PollSet.findOne({ where: { id: pollSetId } });
  expect(updatedPollSet.dtExpiration).toBe('01/06/2030 10:00');
});

test('Poll should add answers', async () => {
  const pollSet = await PollSet.findOne({ where: { id: pollSetId } });
  expect(pollSet.totalAnswers).toBe(0);

  const [alternative1, alternative2] = pollSet
    .getDataValue('polls')[0]
    .getDataValue('alternatives');

  await Answer.bulkCreate([
    {
      email: 'new@test.com',
      alternativeId: alternative1.id
    },
    {
      email: 'new@test.com',
      alternativeId: alternative2.id
    },
    {
      email: 'new@test2.com',
      alternativeId: alternative2.id
    }
  ]);

  await pollSet.reload();

  expect(pollSet.totalAnswers).toBe(2);

  const [alternative1Updated, alternative2Updated] = pollSet
    .getDataValue('polls')[0]
    .getDataValue('alternatives');

  expect(pollSet.totalAnswers).toBe(2);
  expect(alternative1Updated.countVotes).toBe(1);
  expect(alternative2Updated.countVotes).toBe(2);
});
