import { Op } from 'sequelize';

import { Quiz } from '../models';

// every minute
export const cronTime = '0 * * * * *';

export const cronTask = async (): Promise<Quiz[]> => {
  const quizesToClose = await Quiz.findAll({
    where: {
      status: Quiz.Status.ACTIVE,
      expiration: {
        [Op.lte]: new Date()
      }
    }
  });

  quizesToClose.forEach(async quiz => {
    await quiz.update({ status: Quiz.Status.CLOSED });
  });

  return quizesToClose;
};
