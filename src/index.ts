import dotenv from 'dotenv';

import Server from './server';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

const PORT = process.env.PORT || 3000;

const server = new Server({ port: Number(PORT) });

server.listen();

export default server;
