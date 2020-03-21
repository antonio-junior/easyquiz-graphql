import { Table, Column, DataType, Model, HasMany } from 'sequelize-typescript';

import Poll from './Poll';

@Table({
  tableName: 'users'
})
export default class User extends Model<User> {
  @Column(DataType.TEXT)
  name!: string;

  @Column(DataType.TEXT)
  email!: string;

  @HasMany(() => Poll, 'userId')
  polls?: Poll[];
}
