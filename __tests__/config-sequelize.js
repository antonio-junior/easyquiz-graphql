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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const config = () => {
  dotenv.config({
    path: '.env.test'
  });

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.DB_STORAGE
  });

  sequelize.addModels([Alternative, Answer, Invite, Poll, PollSet, User]);
};

export default config;
