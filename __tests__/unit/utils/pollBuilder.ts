/* eslint-disable @typescript-eslint/explicit-function-return-type */
import faker from 'faker';
import _ from 'lodash';

import { Poll, PollSet } from '../../../src/models';
import { createFakeUser } from './userBuilder';

const getFakePoll = async (attrsToUpdate: object | null | undefined = null) => {
  const user = await createFakeUser();

  const result = {
    title: faker.lorem.sentence(5),
    uuid: '',
    status: PollSet.Status.ACTIVE,
    ispublic: true,
    showpartial: true,
    expiration: null,
    isquiz: true,
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

  return _.merge(result, attrsToUpdate);
};

const createFakePoll = async (
  attrsToUpdate: object | null | undefined = null
) => {
  const fakePoll = await getFakePoll(attrsToUpdate);
  const pollSet = await PollSet.create(fakePoll, {
    include: [Poll]
  });

  return pollSet;
};

export { getFakePoll, createFakePoll };
