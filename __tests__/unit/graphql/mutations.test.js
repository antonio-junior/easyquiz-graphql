import { addPoll, addVote } from '../../../src/graphql/resolvers/mutations';
import { Answer, Poll, User } from '../../../src/models';
import config from '../../config-sequelize';

config();

test('resolver should add a poll', async () => {
  const user = await User.create({ name: 'peter', email: 'peter@gmail.com' });

  const poll = await addPoll(null, {
    title: 'poll title',
    uuid: '',
    allowpublic: true,
    multiple: false,
    partial: true,
    userId: user.get('id'),
    answers: ['resposta 1', 'resposta 2']
  });

  expect((await poll.$get('answers')).length).toBeGreaterThan(1);
});

test('resolver should add a vote', async () => {
  const poll = await Poll.findOne();

  const answer = await Answer.create({
    description: 'nova resposta',
    votes: 9,
    pollId: poll.id
  });

  const votedAnswer = await addVote(null, { answerId: answer.get('id') });

  expect(votedAnswer.get('votes')).toBe(10);
});
