import { Answer, Poll, Vote } from '../../models';

const addPoll = (
  _root: unknown,
  {
    title,
    allowpublic,
    multiple,
    partial,
    userId,
    answers
  }: {
    title: string;
    allowpublic: boolean;
    multiple: boolean;
    partial: boolean;
    userId: number;
    answers: string[];
  }
): Promise<Poll> => {
  const answersMap = answers.map(answer => {
    return { description: answer };
  });

  return Poll.create(
    {
      uuid: '',
      status: '',
      title,
      allowpublic,
      multiple,
      partial,
      userId,
      answers: answersMap
    },
    {
      include: [Answer]
    }
  );
};

const addVote = async (
  _root: unknown,
  { answerId }: { answerId: number }
): Promise<boolean> => {
  await Vote.create({
    byMail: 'aaaa@sss.com',
    byIP: '123.232.100',
    answerId
  });

  return Promise.resolve(true);
};
export { addPoll, addVote };
