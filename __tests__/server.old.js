import request from 'supertest';

import Server from '../src/server';

const server = new Server({ port: 3000 });
test('route / should return code 200', async () => {
  const response = await request(server.app).get('/');

  expect(response.status).toBe(200);
});
