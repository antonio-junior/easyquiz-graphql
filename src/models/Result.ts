import {
  HasMany,
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  Model,
  DefaultScope
} from 'sequelize-typescript';

import returnModel from '../decorators';
import Answer from './Answer';
import Quiz from './Quiz';
import User from './User';

@DefaultScope(() => ({
  include: [Answer]
}))
@Table({
  tableName: 'results'
})
export default class Result extends Model<Result> {
  @ForeignKey(returnModel(User))
  @Column(DataType.INTEGER)
  userId!: number;

  @ForeignKey(returnModel(Quiz))
  @Column(DataType.INTEGER)
  quizId!: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @HasMany(() => Answer, 'resultId')
  answers!: Answer[];
}
