import { poll, polls } from '../../../src/graphql/resolvers/queries';
import { User, Poll } from '../../../src/models';
import config from '../../config-sequelize';

config();

test('resolver should return a poll', async () => {
  const user = await User.create({ name: 'roger', email: 'roger@gmail.com' });

  const createdPoll = await Poll.create({
    title: 'nova pergunta',
    uuid: '',
    status: 'ativo',
    allowpublic: true,
    multiple: true,
    partial: true,
    userId: user.id
  });

  const returnedPoll = await poll(null, { id: createdPoll.get('id') });

  expect(returnedPoll.get('title')).toBe(createdPoll.get('title'));
});

test('resolver should return all user polls', async () => {
  const user = await User.create({ name: 'paul', email: 'paul@gmail.com' });

  await Poll.bulkCreate([
    {
      title: 'nova pergunta 2',
      uuid: '',
      status: 'ativo',
      allowpublic: true,
      multiple: true,
      partial: true,
      userId: user.id
    },
    {
      title: 'nova pergunta 3',
      uuid: '',
      status: 'ativo',
      allowpublic: true,
      multiple: true,
      partial: true,
      userId: user.id
    }
  ]);

  const userPolls = await polls(null, { userId: user.get('id') });

  expect(userPolls.length).toBe(2);
});
