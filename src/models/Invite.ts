import {
  NotEmpty,
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import PollSet from './PollSet';

@Table({
  tableName: 'invites'
})
export default class Invite extends Model<Invite> {
  @NotEmpty
  @Column(DataType.TEXT)
  email!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(() => PollSet)
  @Column(DataType.INTEGER)
  pollsetId!: number;
}
