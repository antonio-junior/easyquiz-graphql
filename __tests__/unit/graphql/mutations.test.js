import { addPoll, addVote } from '../../../src/graphql/resolvers/mutations';
import { Answer, User, Poll } from '../../../src/models';
import config from '../../config-sequelize';

config();

test('resolver should add a poll', async () => {
  expect.assertions(2);

  const user = await User.create({ name: 'peter', email: 'peter@gmail.com' });

  const poll = await addPoll(null, {
    title: 'poll title',
    uuid: '',
    allowpublic: true,
    multiple: false,
    partial: true,
    expiration: '23-04-2020 04:30',
    userId: user.get('id'),
    answers: ['resposta 1', 'resposta 2']
  });

  expect(poll.dtExpiration).toBe('23/04/2020 04:30');
  expect((await poll.$get('answers')).length).toBeGreaterThan(1);
});

test('resolver should add votes', async () => {
  expect.assertions(2);
  let answer = await Answer.findOne();

  const votedAnswer = await addVote(null, { answerId: answer.get('id') });
  await addVote(null, { answerId: answer.get('id') });

  expect(votedAnswer).toBe(true);

  answer = await answer.reload();
  expect(answer.votes.length).toBeGreaterThanOrEqual(2);
});

test('Poll should have votes', async () => {
  const poll = await Poll.findOne();

  expect(poll.totalVotes).toBeGreaterThanOrEqual(2);
});
