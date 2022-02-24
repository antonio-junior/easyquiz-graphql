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

import Quiz from './Quiz';

@DefaultScope(() => ({
  include: [Quiz]
}))
@Table({
  tableName: 'users'
})
export default class User extends Model<User> {
  @Length({ min: 3 })
  @Column(DataType.TEXT)
  name!: string;

  @IsEmail
  @Column(DataType.TEXT)
  email!: string;

  @Column(DataType.TEXT)
  password!: string;

  @HasMany(() => Quiz, 'userId')
  quizes?: Quiz[];
}
