import {
  NotEmpty,
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
  @NotEmpty
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

  get countVotes(): number {
    const arrVotes = this.getDataValue('votes') ?? [];
    return arrVotes.length;
  }
}
