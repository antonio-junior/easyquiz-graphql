import { Poll, User } from '../../../src/models';
import config from '../../config-sequelize';

config();

const email = 'tony@gmail.com';
let pollId = 0;
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pollTests = () => {
  test('should create a poll', async () => {
    const name = 'tony';

    const user = await User.create({ name, email });

    const poll = await Poll.create({
      title: 'a pergunta',
      uuid: '',
      status: Poll.Status.ACTIVE,
      allowpublic: true,
      multiple: true,
      partial: true,
      userId: user.get('id')
    });

    pollId = poll.get('id');
    expect(poll.getDataValue('title')).toBe('a pergunta');
  });

  test('User should have one poll', async () => {
    const user = await User.findOne({ where: { email } });
    expect((await user.$get('polls')).length).toBe(1);
  });

  test('Poll should belongs to an user', async () => {
    const poll = await Poll.findOne({ where: { id: pollId } });
    expect(poll.get('userId')).toBeTruthy();
  });

  test('Poll should return expiration date in a friendly format', async () => {
    const user = await User.findOne({ where: { email } });

    const poll = await Poll.create({
      title: 'a nova pergunta',
      status: Poll.Status.ACTIVE,
      uuid: '',
      allowpublic: true,
      multiple: true,
      partial: true,
      expiration: new Date(2020, 5, 1, 10, 0), // month is zero based
      userId: user.id
    });

    expect(poll.dtExpiration).toBe('01/06/2020 10:00');
  });
};

export default pollTests;
