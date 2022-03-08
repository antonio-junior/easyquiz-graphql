import {
  NotEmpty,
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  IsEmail,
  Model
} from 'sequelize-typescript';

import returnModel from '../helpers/decorators';
import Quiz from './Quiz';

@Table({
  tableName: 'invites'
})
export default class Invite extends Model<Invite> {
  @IsEmail
  @NotEmpty
  @Column(DataType.TEXT)
  email!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(returnModel(Quiz))
  @Column(DataType.INTEGER)
  quizId!: number;
}
