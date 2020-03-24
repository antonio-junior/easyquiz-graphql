import dotenv from 'dotenv';
import pg from 'pg';
import { Sequelize } from 'sequelize-typescript';

import { Answer, Poll, User, Vote } from '../models';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  dialect: process.env.DB_IS_POSTGRES ? 'postgres' : 'sqlite',
  username: process.env.DB_USER,
  password: process.env.DB_PWD,
  dialectOptions: {
    useUTC: false // for reading from database
  }
});

sequelize.addModels([Answer, Poll, User, Vote]);

export default sequelize;
