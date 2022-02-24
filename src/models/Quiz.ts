/* eslint-disable no-param-reassign */
import {
  IsAfter,
  NotEmpty,
  Table,
  Column,
  DataType,
  DefaultScope,
  ForeignKey,
  Model,
  HasMany,
  CreatedAt,
  BeforeCreate
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

import Question from './Question';
import Result from './Result';
import User from './User';

enum Status {
  ACTIVE = 'ACTIVE',
  PAUSED = 'SUSPENDED',
  CLOSED = 'CLOSED'
}

const TODAY = new Date().toISOString();
@DefaultScope(() => ({
  include: [Question]
}))
@Table({
  tableName: 'quizes'
})
export default class Quiz extends Model<Quiz> {
  @BeforeCreate
  static initValues(instance: Quiz): void {
    instance.uuid = uuidv4();
    instance.status = Status.ACTIVE;
  }

  static Status = Status;

  @NotEmpty
  @Column(DataType.TEXT)
  title!: string;

  @Column(DataType.TEXT)
  uuid?: string;

  @Column(DataType.TEXT)
  status?: string;

  @Column(DataType.BOOLEAN)
  showPartial?: boolean;

  @Column(DataType.BOOLEAN)
  isPublic?: boolean;

  @IsAfter(TODAY)
  @Column(DataType.DATE)
  expiration?: Date;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  getDateField = (fieldDescription: {
    [field: string]: 'numeric' | '2-digit' | boolean;
  }): string => {
    const date = this.getDataValue('expiration');

    return new Intl.DateTimeFormat('en', fieldDescription).format(date);
  };

  get dtExpiration(): string {
    const year = this.getDateField({ year: 'numeric' });
    const month = this.getDateField({ month: '2-digit' });
    const day = this.getDateField({ day: '2-digit' });
    const minute = this.getDateField({ minute: 'numeric' });
    const hour = this.getDateField({
      hour: 'numeric',
      hour12: false
    });

    return `${day}/${month}/${year} ${hour}:${minute}`;
  }

  @HasMany(() => Question, 'quizId')
  questions!: Question[];

  @HasMany(() => Result, 'quizId')
  results?: Result[];

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;
}
