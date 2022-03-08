import {
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import returnModel from '../helpers/decorators';
import Alternative from './Alternative';
import Question from './Question';

@Table({
  tableName: 'answers'
})
export default class Answer extends Model<Answer> {
  @ForeignKey(returnModel(Alternative))
  @Column(DataType.INTEGER)
  choice!: number;

  @ForeignKey(returnModel(Question))
  @Column(DataType.INTEGER)
  questionId!: number;
}
