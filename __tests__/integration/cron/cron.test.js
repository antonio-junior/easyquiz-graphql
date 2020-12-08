import { cronTime, cronTask } from '../../../src/cron/CronJob';
import { Quiz } from '../../../src/models';
import config from '../../config-sequelize';
import { createFakeQuiz } from '../utils/quizBuilder';

config();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const delay = ms => new Promise(res => setTimeout(res, ms));

describe('CronJob', () => {
  test('cronTime should be truthy', () => {
    expect(cronTime).toBeTruthy();
  });

  test('cronTask should run', async () => {
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

    await createFakeQuiz({ expiration });

    await delay(2000);
    await cronTask();

    const closeds = await Quiz.findAll({
      where: { status: Quiz.Status.CLOSED }
    });

    expect(closeds.length).toBe(1);
  });
});
