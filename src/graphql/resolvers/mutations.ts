import * as moment from 'moment';

import { Answer, Poll, Vote } from '../../models';

const addPoll = (
  _root: unknown,
  {
    title,
    allowpublic,
    multiple,
    partial,
    userId,
    expiration,
    answers
  }: {
    title: string;
    allowpublic: boolean;
    multiple: boolean;
    partial: boolean;
    userId: number;
    expiration: string;
    answers: string[];
  }
): Promise<Poll> => {
  const answersMap = answers.map(answer => {
    return { description: answer };
  });

  const expirationDate = moment.parseZone(expiration, 'DD-MM-YYYY hh:mm');

  return Poll.create(
    {
      uuid: '',
      status: '',
      title,
      allowpublic,
      multiple,
      partial,
      userId,
      expiration: expirationDate,
      answers: answersMap
    },
    {
      include: [Answer]
    }
  );
};

const addVote = async (
  _root: unknown,
  { answerId, mail, ip }: { answerId: number; mail: string; ip: string }
): Promise<boolean> => {
  await Vote.create({
    byMail: mail,
    byIP: ip,
    answerId
  });

  return Promise.resolve(true);
};
export { addPoll, addVote };
