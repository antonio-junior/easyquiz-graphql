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

import Answer from './Answer';
import Poll from './Poll';

@DefaultScope(() => ({
  include: [Answer]
}))
@Table({
  tableName: 'alternatives'
})
export default class Alternative extends Model<Alternative> {
  @NotEmpty
  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.BOOLEAN)
  isright?: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(() => Poll)
  @Column(DataType.INTEGER)
  pollId!: number;

  @HasMany(() => Answer, 'alternativeId')
  answers: Answer[] = [];
}
