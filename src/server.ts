import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import { CronJob } from 'cron';
import express, { Application } from 'express';
import { Sequelize } from 'sequelize-typescript';

import sequelize from './database/connection';
import resolvers from './graphql/resolvers';
import typeDefs from './graphql/typeDefs';
import { cronTime, cronTask } from './utils/CronJob';

class Server {
  private sequelize: Sequelize = sequelize;

  public app: Application = express();

  public job = new CronJob(cronTime, cronTask);

  private port: number;

  public apolloServer = new ApolloServer({ resolvers, typeDefs });

  public constructor(appInit: { port: number }) {
    this.port = appInit.port;
    this.sequelize.validate();
    this.middlewares();
    this.job.start();
  }

  private middlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
    this.apolloServer.applyMiddleware({ app: this.app, path: '/graphql' });
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      global.log.debug(`App listening on http://localhost:${this.port}`);
    });
  }
}
export default Server;
