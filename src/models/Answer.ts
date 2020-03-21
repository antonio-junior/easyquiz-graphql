import {
  DefaultScope,
  HasMany,
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import Poll from './Poll';
import Vote from './Vote';

@DefaultScope(() => ({
  include: [Vote]
}))
@Table({
  tableName: 'answers'
})
export default class Answer extends Model<Answer> {
  @Column(DataType.TEXT)
  description!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(() => Poll)
  @Column(DataType.INTEGER)
  pollId!: number;

  @HasMany(() => Vote, 'answerId')
  votes?: Vote[];
}
