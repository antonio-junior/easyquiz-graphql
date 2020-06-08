import { cronTime, cronTask } from '../../../src/cron/CronJob';
import { Poll, PollSet, User } from '../../../src/models';
import config from '../../config-sequelize';

config();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const delay = ms => new Promise(res => setTimeout(res, ms));

describe('CronJob', () => {
  test('cronTime should be truthy', () => {
    expect(cronTime).toBeTruthy();
  });

  test('cronTask should run', async () => {
    const name = 'cronuser';
    const email = 'cronuser@gmail.com';

    const user = await User.create({ name, email });

    const now = new Date();
    const expiration = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      now.getHours(),
      now.getMinutes(),
      now.getSeconds() + 1,
      now.getMilliseconds()
    );

    await PollSet.create(
      {
        title: 'New Poll',
        uuid: '',
        status: PollSet.Status.ACTIVE,
        allowpublic: true,
        partial: true,
        userId: user.get('id'),
        expiration,
        polls: [
          {
            question: 'the question',
            maxselections: 1,
            alternatives: [
              { description: 'alternative 1' },
              { description: 'alternative 2' }
            ]
          }
        ]
      },
      {
        include: [Poll]
      }
    );

    await delay(2000);
    await cronTask();

    const closeds = await PollSet.findAll({
      where: { status: PollSet.Status.CLOSED }
    });

    expect(closeds.length).toBe(1);
  });
});
