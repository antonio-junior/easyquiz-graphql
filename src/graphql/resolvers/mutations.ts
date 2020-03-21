import { Answer, Poll } from '../../models';

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
    return { description: answer, votes: 0 };
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
): Promise<Answer> => {
  await Answer.increment({ votes: 1 }, { where: { id: answerId } });
  return Answer.findByPk(answerId, { rejectOnEmpty: false });
};
export { addPoll, addVote };
