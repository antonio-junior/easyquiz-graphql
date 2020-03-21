import { Poll } from '../../models';

const poll = (_root: unknown, { id }: { id: number }): Promise<Poll> =>
  Poll.findByPk(id);

const polls = (
  _root: unknown,
  { userId }: { userId: number }
): Promise<Poll[]> => Poll.findAll({ where: { userId } });

export { poll, polls };
