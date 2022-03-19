import { ApolloServer, PubSub } from 'apollo-server-express';
import cookieParser from 'cookie-parser';
import { CronJob } from 'cron';
import express, { Application, Request, Response } from 'express';
import http from 'http';
import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize-typescript';
import { ExecutionParams } from 'subscriptions-transport-ws';

import { cronTime, cronTask } from './helpers/CronJob';
import sequelize from './database/connection';
import schema from './graphql/schema';
import { validate } from './helpers/mail';
import { COOKIE_NAME } from './graphql/user/resolvers';

interface UserContext {
  userId: number;
  email: string;
}
interface SessionContext extends UserContext {
  res: Response;
  pubSub: PubSub;
}

class Server {
  private sequelize: Sequelize = sequelize;

  public app: Application = express();

  public job = new CronJob(cronTime, cronTask);

  private port: number;

  private pubSub = new PubSub();

  private httpServer = http.createServer(this.app);

  public apolloServer = new ApolloServer({
    introspection: true,
    playground: true,
    schema,
    context: ({
      req,
      res,
      connection
    }: {
      req: Request;
      res: Response;
      connection: ExecutionParams;
    }): SessionContext => {
      const defaultSessionContext = {
        userId: 0,
        email: '',
        res,
        pubSub: this.pubSub
      };

      // it's a Subscription request
      if (connection) return defaultSessionContext;

      const token = req.cookies[COOKIE_NAME];

      if (!token) return defaultSessionContext;

      try {
        const user = jwt.verify(
          token,
          process.env.SECRET_KEY as string
        ) as UserContext;

        return { pubSub: this.pubSub, res, ...user };
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
    this.app.use(cookieParser());
    this.app.get('/validate', validate);
    this.apolloServer.applyMiddleware({
      app: this.app,
      path: '/graphql'
    });
    this.apolloServer.installSubscriptionHandlers(this.httpServer);
  }

  public getServerURL(): string {
    return `http://localhost:${this.port}${this.apolloServer.graphqlPath}`;
  }

  public listen(): void {
    this.httpServer.listen(this.port, () => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log(`🚀 Server ready at ${this.getServerURL()}`);
      }
    });
  }

  public close(): void {
    this.job.stop();
    this.httpServer.close();
  }
}
export default Server;
