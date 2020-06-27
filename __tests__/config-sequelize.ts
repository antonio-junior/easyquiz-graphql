import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';

import {
  Alternative,
  Answer,
  Invite,
  Poll,
  PollSet,
  User
} from '../src/models';

const config = (): void => {
  dotenv.config({
    path: '.env.test'
  });

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    logging: false,
    storage: process.env.DB_STORAGE
  });

  sequelize.addModels([Alternative, Answer, Invite, Poll, PollSet, User]);
};

export default config;
