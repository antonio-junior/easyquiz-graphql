import { Answer, Poll, User } from '../../../src/models';
import config from '../../config-sequelize';

config();
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const answerTests = () => {
  test('should create answers', async () => {
    const name = 'answerowner';
    const email = 'answerowner@gmail.com';

    const user = await User.create({ name, email });

    const poll = await Poll.create({
      title: 'new title',
      uuid: '',
      status: 'ACTIVE',
      allowpublic: true,
      multiple: true,
      partial: true,
      userId: user.get('id')
    });

    await Answer.bulkCreate([
      { description: 'resposta 2', pollId: poll.id },
      { description: 'resposta 1', pollId: poll.id }
    ]);

    await Answer.create({
      description: 'resposta 3',
      pollId: poll.id
    });

    const newPoll = await Poll.findByPk(poll.id);
    expect((await newPoll.$get('answers')).length).toBe(3);
  });
};

export default answerTests;
