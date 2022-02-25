import request from 'supertest';

import { COOKIE_NAME, tokenize } from '../../../src/graphql/user/resolvers';
import server from '../../../src/index';
import config from '../../config-sequelize';
import { createFakeQuiz } from '../utils/quizBuilder';
import { createFakeUser } from '../utils/userBuilder';

config();

describe('Server Test', () => {
  afterAll(() => {
    server.close();
  });
  test('should start server', async done => {
    await createFakeQuiz();

    request(server.app)
      .post('/graphql')
      .send({ query: '{ publicQuizes { title }}' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).toHaveProperty('body.data.publicQuizes');
        return done();
      });
  });

  test('should start server with a wrong token', async done => {
    await createFakeQuiz();

    request(server.app)
      .post('/graphql')
      .set('Cookie', `${COOKIE_NAME}=123456`)
      .send({ query: '{ publicQuizes { title }}' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).toHaveProperty('body.data.publicQuizes');
        return done();
      });
  });

  test('should start server with a valid token', async done => {
    const { email, id } = await createFakeUser();
    const token = tokenize(email, id || '0');

    request(server.app)
      .post('/graphql')
      .set('Cookie', `${COOKIE_NAME}=${token}`)
      .send({ query: '{ publicQuizes { title }}' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).toHaveProperty('body.data.publicQuizes');
        return done();
      });
  });

  test('should return server URL', () => {
    expect(server.getServerURL()).not.toBeNull();
  });
});
