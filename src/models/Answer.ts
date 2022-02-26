import {
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import Alternative from './Alternative';
import Question from './Question';

@Table({
  tableName: 'answers'
})
export default class Answer extends Model<Answer> {
  @ForeignKey(() => Alternative)
  @Column(DataType.INTEGER)
  choice!: number;

  @ForeignKey(() => Question)
  @Column(DataType.INTEGER)
  questionId!: number;
}
