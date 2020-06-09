import { ApolloServer } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { CronJob } from 'cron';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize-typescript';

import { cronTime, cronTask } from './cron/CronJob';
import sequelize from './database/connection';
import schema from './graphql/schema';
import { COOKIE_NAME } from './graphql/users/resolvers';

interface UserContext {
  userId: number;
  email: string;
}
interface SessionContext extends UserContext {
  res: Response;
}

class Server {
  private sequelize: Sequelize = sequelize;

  public app: Application = express();

  public job = new CronJob(cronTime, cronTask);

  private port: number;

  public apolloServer = new ApolloServer({
    schema,
    context: ({
      req,
      res
    }: {
      req: Request;
      res: Response;
    }): SessionContext => {
      const defaultSessionContext = { userId: 0, email: '', res };

      const token = req.cookies[COOKIE_NAME];

      if (!token) return defaultSessionContext;

      try {
        const user = jwt.verify(
          token,
          process.env.SECRET_KEY ?? 'secret'
        ) as UserContext;

        return { res, ...user };
      } catch {
        return defaultSessionContext;
      }
    }
  });

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
    this.app.use(cookieParser());
    this.app.use(helmet());
    this.apolloServer.applyMiddleware({ app: this.app, path: '/graphql' });
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      // eslint-disable-next-line no-console
      console.log(
        `Graphql server listening on http://localhost:${this.port}${this.apolloServer.graphqlPath}`
      );
    });
  }
}
export default Server;
