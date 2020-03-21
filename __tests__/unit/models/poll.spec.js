import { Poll, User } from '../../../src/models';
import { Status } from '../../../src/models/Poll';
import config from '../../config-sequelize';

config();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const pollTests = () => {
  test('should create a poll', async () => {
    const user = await User.findOne();

    const poll = await Poll.create({
      title: 'a pergunta',
      uuid: '',
      status: Status.ACTIVE,
      allowpublic: true,
      multiple: true,
      partial: true,
      userId: user.id
    });

    expect(poll.getDataValue('title')).toBe('a pergunta');
  });

  test('User should have at least one poll', async () => {
    const user = await User.findOne({ include: [Poll] });
    expect((await user.$get('polls')).length).toBeGreaterThanOrEqual(1);
  });

  test('Poll should belongs to an user', async () => {
    const poll = await Poll.findOne();
    expect(poll.get('userId')).toBeTruthy();
  });

  test('Poll should return expiration date in a friendly format', async () => {
    const user = await User.findOne();

    const poll = await Poll.create({
      title: 'a nova pergunta',
      status: Status.ACTIVE,
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
