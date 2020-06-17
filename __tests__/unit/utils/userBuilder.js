/* eslint-disable @typescript-eslint/explicit-function-return-type */
import bcrypt from 'bcrypt';
import faker from 'faker';

import { User } from '../../../src/models';

const getFakeUser = () => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(6),
    name: faker.name.findName()
  };
};

const createFakeUser = async () => {
  const fakeUser = getFakeUser();
  const user = await User.create({
    ...fakeUser,
    password: bcrypt.hashSync(fakeUser.password, 10)
  });

  const result = { ...fakeUser, id: user.id };
  return result;
};

export { createFakeUser, getFakeUser };
