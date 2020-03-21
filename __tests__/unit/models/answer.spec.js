import { Answer, Poll } from '../../../src/models';
import config from '../../config-sequelize';

config();
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const answerTests = () => {
  test('should create answers', async () => {
    const poll = await Poll.findOne();

    await Answer.bulkCreate([
      { description: 'resposta 2', votes: 1, pollId: poll.id },
      { description: 'resposta 1', votes: 2, pollId: poll.id }
    ]);

    await Answer.create({
      description: 'resposta 3',
      votes: 5,
      pollId: poll.id
    });

    expect(await Answer.count()).toBeGreaterThanOrEqual(3);
  });

  test('poll should have answers', async () => {
    const poll = await Poll.findOne();
    expect((await poll.$get('answers')).length).toBeGreaterThan(1);
  });
};

export default answerTests;
