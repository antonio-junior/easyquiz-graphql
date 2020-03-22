import * as moment from 'moment';
import { Op } from 'sequelize';

import { Poll } from '../models';
import { Status } from '../models/Poll';

// every minute
export const cronTime = '0 * * * * *';

const isTimeExpired = (expirationDate: moment.Moment): boolean => {
  const now = moment.parseZone(new Date());

  return expirationDate.isSameOrBefore(now);
};

const closePoll = (poll: Poll): void => {
  // why 3 hours are being added automatically ? So, removing.
  const expirationDate = moment
    .parseZone(poll.expiration)
    .subtract('3', 'hour');

  if (isTimeExpired(expirationDate)) {
    poll.update({ status: Status.CLOSED }).then(updated => {
      global.log.info(`Poll closed: ID ${updated.get('id')}`);
    });
  }
};

export const cronTask = (): void => {
  Poll.findAll({
    where: {
      status: Status.ACTIVE,
      expiration: {
        [Op.not]: null
      }
    }
  }).then(polls => polls.forEach(closePoll));
};
