import { Poll, User } from '../../../src/models';
import { cronTime, cronTask } from '../../../src/utils/CronJob';
import config from '../../config-sequelize';

config();

const delay = ms => new Promise(res => setTimeout(res, ms));

describe('CronJob', () => {
  test('cronTime should be truthy', () => {
    expect(cronTime).toBeTruthy();
  });

  test('cronTask should run', async () => {
    expect.assertions(2);

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

    await Poll.create({
      title: 'a pergunta',
      uuid: '',
      status: Poll.Status.ACTIVE,
      allowpublic: true,
      multiple: true,
      partial: true,
      expiration,
      userId: user.get('id')
    });

    await delay(2000);
    await cronTask();

    const closeds = await Poll.findAll({
      where: { status: Poll.Status.CLOSED }
    });
    const actives = await Poll.findAll({
      where: { status: Poll.Status.ACTIVE }
    });

    expect(closeds.length).toBe(1);
    expect(actives.length).toBe(0);
  });
});
