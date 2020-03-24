import { Op } from 'sequelize';

import { Poll } from '../models';

// every minute
export const cronTime = '0 * * * * *';

export const cronTask = async (): Promise<Poll[]> => {
  const pollsToClose = await Poll.findAll({
    where: {
      status: Poll.Status.ACTIVE,
      expiration: {
        [Op.lte]: new Date()
      }
    }
  });

  pollsToClose.forEach(async poll => {
    await poll.update({ status: Poll.Status.CLOSED });
  });

  return pollsToClose;
};
