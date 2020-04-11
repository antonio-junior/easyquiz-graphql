import { addPoll, addAnswer } from '../../../src/graphql/resolvers/mutations';
import { Alternative, User, PollSet } from '../../../src/models';
import config from '../../config-sequelize';

config();

let arrAlternatives = [];
let pollSetId = 0;

test('resolver should add a poll', async () => {
  const user = await User.create({ name: 'peter', email: 'peter@gmail.com' });

  const alternatives = [{ description: 'resp1' }, { description: 'resp2' }];
  const polls = [
    {
      question: 'pergunta 1',
      maxselections: 1,
      rightanswer: 0,
      alternatives
    }
  ];

  const pollset = await addPoll(null, {
    title: 'poll title',
    allowpublic: true,
    partial: true,
    expiration: '23-04-2021 04:30',
    userId: user.get('id'),
    polls
  });

  expect(pollset.dtExpiration).toBe('23/04/2021 04:30');
  pollSetId = pollset.id;

  const [poll] = pollset.getDataValue('polls');
  arrAlternatives = poll.getDataValue('alternatives');
  expect(arrAlternatives.length).toBe(2);
});

test('resolver should add answers', async () => {
  const [{ id: alt1id }, { id: alt2id }] = arrAlternatives;

  await addAnswer(null, {
    answers: [{ alternativeId: alt1id, email: 'newuser@test.com' }]
  });
  await addAnswer(null, {
    answers: [
      { alternativeId: alt1id, email: 'newuser2@test.com' },
      { alternativeId: alt2id, email: 'newuser2@test.com' }
    ]
  });

  const pollset = await PollSet.findByPk(pollSetId, {
    rejectOnEmpty: false
  });
  const alternative1 = await Alternative.findByPk(alt1id, {
    rejectOnEmpty: false
  });
  const alternative2 = await Alternative.findByPk(alt2id, {
    rejectOnEmpty: false
  });

  expect(alternative1.countVotes).toBe(2);
  expect(alternative2.countVotes).toBe(1);
  expect(pollset.totalAnswers).toBe(2);
});
