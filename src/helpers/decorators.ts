import { Model, ModelClassGetter } from 'sequelize-typescript';

const returnModel = (T: typeof Model): ModelClassGetter => {
  return (): typeof Model => T;
};

export default returnModel;
