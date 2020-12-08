import {
  NotEmpty,
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import Answer from './Answer';
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

  @ForeignKey(() => Question)
  @Column(DataType.INTEGER)
  questionId!: number;

  @ForeignKey(() => Answer)
  @Column(DataType.INTEGER)
  answerId!: number;
}
