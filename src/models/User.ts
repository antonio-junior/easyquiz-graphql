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

import { encrypt } from '../graphql/users/resolvers';
import PollSet from './PollSet';
@DefaultScope(() => ({
  include: [PollSet]
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

  @Length({ min: 3, max: 30 })
  @Column(DataType.TEXT)
  name!: string;

  @IsEmail
  @Column(DataType.TEXT)
  email!: string;

  @Column(DataType.TEXT)
  password!: string;

  @HasMany(() => PollSet, 'userId')
  pollSets?: PollSet[];
}
