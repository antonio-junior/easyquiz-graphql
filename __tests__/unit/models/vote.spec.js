import { Answer, Vote } from '../../../src/models';
import config from '../../config-sequelize';

config();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const voteTest = () => {
  test('should add votes', async () => {
    const answer = await Answer.findOne();
    const answerVotesCount = answer.countVotes;

    await Vote.create({
      byMail: 'abc@test.com',
      byIP: '192.168.9.100',
      answerId: answer.get('id')
    });

    await answer.reload();
    expect(answer.countVotes).toBe(answerVotesCount + 1);
  });
};

export default voteTest;
