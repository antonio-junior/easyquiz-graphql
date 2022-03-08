import faker from 'faker';
import request from 'supertest';
import url from 'url';

import sendMail from '../../../src/helpers/mail';
import server from '../../../src/index';

describe('Email Test', () => {
  afterAll(() => {
    server.close();
  });

  test('should validate email link', async done => {
    const email = faker.internet.email();
    const quizId = 1;
    const link = await sendMail(quizId, email);
    const urlLink = new URL(link || '');
    const q = new url.URLSearchParams(urlLink.search);

    request(server.app)
      .get(`/validate?${q.toString()}`)
      .expect(200)
      .end((_, res) => {
        expect(res.text).toBe('"ok"');
        return done();
      });
  });

  test('should validate email link', async done => {
    const email = faker.internet.email();
    const quizId = 1;
    const link = await sendMail(quizId, email);
    const urlLink = new URL(link || '');
    const q = new url.URLSearchParams(urlLink.search);

    request(server.app)
      .get(`/validate?${q.toString()}a`)
      .expect(400)
      .end((_, res) => {
        expect(res.text).toBe('"error"');
        return done();
      });
  });
});
