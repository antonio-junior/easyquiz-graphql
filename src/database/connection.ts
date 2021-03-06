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
} from '../models';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  dialect: process.env.NODE_ENV === 'test' ? 'sqlite' : 'postgres',
  username: process.env.DB_USER,
  password: process.env.DB_PWD,
  logging: false,
  dialectOptions: {
    returning: true,
    useUTC: false // for reading from database
  }
});

sequelize.addModels([
  Alternative,
  Answer,
  Invite,
  Question,
  Quiz,
  Result,
  User
]);

export default sequelize;
