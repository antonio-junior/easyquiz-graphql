/* eslint-disable @typescript-eslint/explicit-function-return-type */
import faker from 'faker';

import { Poll, PollSet } from '../../../src/models';
import { createFakeUser } from './userBuilder';

const getFakePoll = async () => {
  const user = await createFakeUser();

  return {
    title: faker.lorem.sentence(5),
    uuid: '',
    status: PollSet.Status.ACTIVE,
    ispublic: true,
    partial: true,
    userId: user.id,
    polls: [
      {
        question: faker.lorem.sentence(10),
        maxselections: 1,
        alternatives: [
          { description: faker.lorem.sentence(3), isright: true },
          { description: faker.lorem.sentence(4) }
        ]
      }
    ]
  };
};

const createFakePoll = async attrsToUpdate => {
  const fakePoll = await getFakePoll();
  const pollSet = await PollSet.create(
    { ...fakePoll, ...attrsToUpdate },
    {
      include: [Poll]
    }
  );

  return pollSet;
};

export { getFakePoll, createFakePoll };
