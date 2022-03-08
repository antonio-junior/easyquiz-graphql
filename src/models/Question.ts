/* eslint-disable no-param-reassign */
import {
  NotEmpty,
  Table,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  HasMany,
  CreatedAt
} from 'sequelize-typescript';

import returnModel from '../helpers/decorators';
import Alternative from './Alternative';
import Quiz from './Quiz';

@DefaultScope(() => ({
  include: [Alternative]
}))
@Table({
  tableName: 'questions'
})
export default class Question extends Model<Question> {
  @NotEmpty
  @Column(DataType.TEXT)
  query!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @HasMany(() => Alternative, 'questionId')
  alternatives!: Alternative[];

  @ForeignKey(returnModel(Quiz))
  @Column(DataType.INTEGER)
  quizId!: number;
}
