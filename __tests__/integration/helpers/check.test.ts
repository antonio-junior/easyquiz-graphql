import request from 'supertest';

import server from '../../../src/index';

describe('Route Test', () => {
  afterAll(() => {
    server.close();
  });

  test('route /check should code 200', done => {
    request(server.app)
      .get('/check')
      .expect(200, done);
  });
});
