import {
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import Poll from './Poll';

@Table({
  tableName: 'answers'
})
export default class Answer extends Model<Answer> {
  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.NUMBER)
  votes!: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(() => Poll)
  @Column(DataType.INTEGER)
  pollId!: number;
}
