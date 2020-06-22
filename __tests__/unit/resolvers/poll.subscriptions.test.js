import { gql } from 'apollo-server-express';

import config from '../../config-sequelize';
import { tester } from '../utils/tester';

config();

describe('Test Poll Subscriptions', () => {
  test('should validate invite subscription', async () => {
    const pollSubscription = gql`
      subscription {
        invited {
          id
          title
        }
      }
    `;

    tester.test(true, pollSubscription);
  });
});
