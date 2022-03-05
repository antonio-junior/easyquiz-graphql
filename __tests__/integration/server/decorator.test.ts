import returnModel from '../../../src/decorators';
import { User } from '../../../src/models';

describe('Decorator Test', () => {
  test('should validate decorator function', () => {
    const returnedModel = returnModel(User);
    expect(returnedModel()).toBeInstanceOf(Function);
  });
});
