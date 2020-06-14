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

import Alternative from './Alternative';
import PollSet from './PollSet';

@DefaultScope(() => ({
  include: [Alternative]
}))
@Table({
  tableName: 'polls'
})
export default class Poll extends Model<Poll> {
  @NotEmpty
  @Column(DataType.TEXT)
  question!: string;

  @Column(DataType.INTEGER)
  maxselections!: number;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @HasMany(() => Alternative, 'pollId')
  alternatives!: Alternative[];

  @ForeignKey(() => PollSet)
  @Column(DataType.INTEGER)
  pollSetId!: number;
}
