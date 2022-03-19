import request from 'supertest';

import server from '../../../src/index';

describe('Email Test', () => {
  afterAll(() => {
    server.close();
  });

  test('route /check should code 200', async done => {
    request(server.app)
      .get('/check')
      .expect(200)
      .end(() => {
        return done();
      });
  });
});
