import {
  DefaultScope,
  Length,
  IsEmail,
  Table,
  Column,
  DataType,
  Model,
  HasMany
} from 'sequelize-typescript';

import PollSet from './PollSet';
@DefaultScope(() => ({
  include: [PollSet]
}))
@Table({
  tableName: 'users'
})
export default class User extends Model<User> {
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
