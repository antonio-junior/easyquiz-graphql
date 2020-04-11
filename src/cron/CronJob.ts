import { Op } from 'sequelize';

import { PollSet } from '../models';

// every minute
export const cronTime = '0 * * * * *';

export const cronTask = async (): Promise<PollSet[]> => {
  const pollSetsToClose = await PollSet.findAll({
    where: {
      status: PollSet.Status.ACTIVE,
      expiration: {
        [Op.lte]: new Date()
      }
    }
  });

  pollSetsToClose.forEach(async pollset => {
    await pollset.update({ status: PollSet.Status.CLOSED });
  });

  return pollSetsToClose;
};
