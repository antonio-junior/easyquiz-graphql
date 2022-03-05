import {
  NotEmpty,
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import returnModel from '../decorators';
import Question from './Question';

@Table({
  tableName: 'alternatives'
})
export default class Alternative extends Model<Alternative> {
  @NotEmpty
  @Column(DataType.TEXT)
  text!: string;

  @Column(DataType.BOOLEAN)
  isRight?: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(returnModel(Question))
  @Column(DataType.INTEGER)
  questionId!: number;
}
