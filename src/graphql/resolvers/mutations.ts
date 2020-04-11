import * as moment from 'moment';

import { Answer, Poll, PollSet } from '../../models';

interface AlternativeInput {
  description: string;
}

interface PollInput {
  question: string;
  maxselections: number;
  rightanswer: number;
  alternatives: AlternativeInput[];
}

const addPoll = (
  _root: unknown,
  {
    title,
    allowpublic,
    partial,
    expiration,
    userId,
    polls
  }: {
    title: string;
    allowpublic: boolean;
    partial: boolean;
    expiration: string;
    userId: number;
    polls: PollInput[];
  }
): Promise<PollSet> => {
  const expirationDate = moment.parseZone(expiration, 'DD-MM-YYYY hh:mm');

  return PollSet.create(
    {
      title,
      uuid: '',
      status: PollSet.Status.ACTIVE,
      allowpublic,
      partial,
      userId,
      expiration: expirationDate,
      polls
    },
    {
      include: [Poll]
    }
  );
};

interface AnswerInput {
  alternativeId: number;
  email: string;
}
const addAnswer = async (
  _root: unknown,
  { answers }: { answers: AnswerInput[] }
): Promise<boolean> => {
  await Answer.bulkCreate(answers);

  return Promise.resolve(true);
};
export { addPoll, addAnswer };
