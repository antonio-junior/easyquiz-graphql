import faker from 'faker';

import { encrypt } from '../../../src/graphql/users/resolvers';
import { User } from '../../../src/models';

export interface UserTest {
  email: string;
  password: string;
  name: string;
  id?: string;
}

const getFakeUser = (): UserTest => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(6),
    name: faker.name.findName()
  };
};

const createFakeUser = async (): Promise<UserTest> => {
  const fakeUser = getFakeUser();

  const password = encrypt(fakeUser.password);

  const user = await User.create({
    ...fakeUser,
    password
  });

  const result = { ...fakeUser, id: user.id };
  return result;
};

export { createFakeUser, getFakeUser };
