import { User } from '../../../src/models';
import config from '../../config-sequelize';

config();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const userTests = () => {
  test('should create a user', async () => {
    const name = 'john';
    const email = 'john@gmail.com';

    await User.create({ name, email });
    expect(await User.count()).toBeGreaterThan(0);
  });
};

export default userTests;
