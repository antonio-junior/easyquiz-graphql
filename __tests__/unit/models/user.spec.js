import { User } from '../../../src/models';
import config from '../../config-sequelize';

config();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const userTests = () => {
  test('should create a user', async () => {
    const name = 'john';
    const email = 'john@gmail.com';

    await User.create({ name, email });

    const newUser = await User.findOne({ where: { email } });
    expect(newUser.get('name')).toBe(name);
  });
};

export default userTests;
