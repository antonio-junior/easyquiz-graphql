import {
  DefaultScope,
  Length,
  IsEmail,
  Table,
  Column,
  DataType,
  Model,
  HasMany,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';

import { encrypt } from '../graphql/user/resolvers';
import Quiz from './Quiz';

@DefaultScope(() => ({
  include: [Quiz]
}))
@Table({
  tableName: 'users'
})
export default class User extends Model<User> {
  @BeforeUpdate
  @BeforeCreate
  static convertHash(instance: User): void {
    // eslint-disable-next-line no-param-reassign
    instance.password = encrypt(instance.password);
  }

  @Length({ min: 3 })
  @Column(DataType.TEXT)
  name!: string;

  @IsEmail
  @Column(DataType.TEXT)
  email!: string;

  @Length({ min: 6, max: 10 })
  @Column(DataType.TEXT)
  password!: string;

  @HasMany(() => Quiz, 'userId')
  quizes?: Quiz[];
}
