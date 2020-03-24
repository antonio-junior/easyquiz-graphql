import { addPoll, addVote } from '../../../src/graphql/resolvers/mutations';
import { Answer, User, Poll } from '../../../src/models';
import config from '../../config-sequelize';

config();

test('resolver should add a poll', async () => {
  expect.assertions(2);

  const user = await User.create({ name: 'peter', email: 'peter@gmail.com' });

  const poll = await addPoll(null, {
    title: 'poll title',
    allowpublic: true,
    multiple: false,
    partial: true,
    expiration: '23-04-2021 04:30',
    userId: user.get('id'),
    answers: ['resposta 1', 'resposta 2']
  });

  expect(poll.dtExpiration).toBe('23/04/2021 04:30');
  expect((await poll.$get('answers')).length).toBeGreaterThan(1);
});

test('resolver should add votes', async () => {
  expect.assertions(3);
  let answer = await Answer.findOne();

  const voted = await addVote(null, {
    answerId: answer.get('id'),
    ip: '192.168.15.7'
  });

  expect(voted).toBe(true);

  await addVote(null, { answerId: answer.get('id'), ip: '192.168.15.7' });
  answer = await answer.reload();

  expect(answer.votes.length).toBeGreaterThanOrEqual(2);

  const poll = await Poll.findByPk(answer.get('pollId'), {
    rejectOnEmpty: false
  });

  expect(poll.totalVotes).toBeGreaterThanOrEqual(2);
});
