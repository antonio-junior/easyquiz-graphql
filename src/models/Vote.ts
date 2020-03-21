import {
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import Answer from './Answer';

@Table({
  tableName: 'votes'
})
export default class Vote extends Model<Vote> {
  @Column(DataType.TEXT)
  byMail!: string;

  @Column(DataType.TEXT)
  byIP!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(() => Answer)
  @Column(DataType.INTEGER)
  answerId!: number;
}
