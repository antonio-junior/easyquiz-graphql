import {
  IsEmail,
  CreatedAt,
  Table,
  Column,
  DataType,
  ForeignKey,
  Model
} from 'sequelize-typescript';

import Alternative from './Alternative';

@Table({
  tableName: 'answers'
})
export default class Answer extends Model<Answer> {
  @IsEmail
  @Column(DataType.TEXT)
  email!: string;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @ForeignKey(() => Alternative)
  @Column(DataType.INTEGER)
  alternativeId!: number;
}
