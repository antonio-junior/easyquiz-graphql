/* eslint-disable @typescript-eslint/explicit-function-return-type */
import faker from 'faker';
import _ from 'lodash';

import { Question, Quiz } from '../../../src/models';
import { createFakeUser } from './userBuilder';

const getFakeQuiz = async (attrsToUpdate: object | null | undefined = null) => {
  const user = await createFakeUser();

  const result = {
    title: faker.lorem.sentence(5),
    status: Quiz.Status.ACTIVE,
    isPublic: true,
    showPartial: true,
    expiration: null,
    userId: user.id,
    questions: [
      {
        query: faker.lorem.sentence(10),
        alternatives: [
          { text: faker.lorem.sentence(3), isRight: true },
          { text: faker.lorem.sentence(4), isRight: false }
        ]
      }
    ]
  };

  return _.merge(result, attrsToUpdate);
};

const createFakeQuiz = async (
  attrsToUpdate: object | null | undefined = null
) => {
  const fakeQuiz = await getFakeQuiz(attrsToUpdate);
  const quiz = await Quiz.create(fakeQuiz, {
    include: [Question]
  });

  return quiz;
};

export { getFakeQuiz, createFakeQuiz };
