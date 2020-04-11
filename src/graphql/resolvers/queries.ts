import { PollSet } from '../../models';

const poll = (_root: unknown, { id }: { id: number }): Promise<PollSet> =>
  PollSet.findByPk(id);

const polls = (
  _root: unknown,
  { userId }: { userId: number }
): Promise<PollSet[]> => PollSet.findAll({ where: { userId } });

export { poll, polls };
