import dotenv from 'dotenv';
import { Sequelize } from 'sequelize-typescript';

import {
  Alternative,
  Answer,
  Invite,
  Question,
  Quiz,
  User,
  Result
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

  sequelize.addModels([
    Alternative,
    Answer,
    Invite,
    Question,
    Quiz,
    User,
    Result
  ]);
};

export default config;
