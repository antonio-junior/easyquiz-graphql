import request from 'supertest';

import { COOKIE_NAME, tokenize } from '../../../src/graphql/users/resolvers';
import server from '../../../src/index';
import config from '../../config-sequelize';
import { createFakePoll } from '../utils/pollBuilder';
import { getFakeUser } from '../utils/userBuilder';

config();

describe('Server Test', () => {
  afterAll(() => {
    server.close();
  });
  test('should start server', async done => {
    await createFakePoll();

    request(server.app)
      .post('/graphql')
      .send({ query: '{ publicPollSets { title }}' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).toHaveProperty('body.data.publicPollSets');
        done();
      });
  });

  test('should start server with a wrong token', async done => {
    await createFakePoll();

    request(server.app)
      .post('/graphql')
      .set('Cookie', `${COOKIE_NAME}=123456`)
      .send({ query: '{ publicPollSets { title }}' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).toHaveProperty('body.data.publicPollSets');
        done();
      });
  });

  test('should start server with a valid token', async done => {
    const { email, id } = getFakeUser();
    const token = tokenize(email, id);

    request(server.app)
      .post('/graphql')
      .set('Cookie', `${COOKIE_NAME}=${token}`)
      .send({ query: '{ publicPollSets { title }}' })
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res).toHaveProperty('body.data.publicPollSets');
        done();
      });
  });

  test('should have a subscriptionURL', () => {
    expect(server.getSubscriptionURL()).not.toBeNull();
  });
});
