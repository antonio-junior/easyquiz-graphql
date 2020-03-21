import log from 'loglevel';

import Server from './server';

log.setLevel('debug');
global.log = log;

const PORT = process.env.PORT || 3000;

const server = new Server({ port: Number(PORT) });

server.listen();
