import {
  Length,
  IsEmail,
  Table,
  Column,
  DataType,
  Model,
  HasMany
} from 'sequelize-typescript';

import Poll from './Poll';

@Table({
  tableName: 'users'
})
export default class User extends Model<User> {
  @Length({ min: 3, max: 15 })
  @Column(DataType.TEXT)
  name!: string;

  @IsEmail
  @Column(DataType.TEXT)
  email!: string;

  @HasMany(() => Poll, 'userId')
  polls?: Poll[];
}
