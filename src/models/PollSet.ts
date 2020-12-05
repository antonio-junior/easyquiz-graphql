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

import Poll from './Poll';
import User from './User';

enum Status {
  ACTIVE = 'ACTIVE',
  PAUSED = 'SUSPENDED',
  CLOSED = 'CLOSED'
}

const TODAY = new Date().toISOString();
@DefaultScope(() => ({
  include: [Poll]
}))
@Table({
  tableName: 'pollsets'
})
export default class PollSet extends Model<PollSet> {
  @BeforeCreate
  static initValues(instance: PollSet): void {
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
  status!: string;

  @Column(DataType.BOOLEAN)
  ispublic?: boolean;

  @Column(DataType.BOOLEAN)
  showpartial!: boolean;

  @Column(DataType.BOOLEAN)
  isquiz!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @IsAfter(TODAY)
  @Column(DataType.DATE)
  expiration?: Date;

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

  @HasMany(() => Poll, 'pollSetId')
  polls!: Poll[];

  get userAnswers(): number {
    const [poll] = this.getDataValue('polls');
    const alternatives = poll.getDataValue('alternatives');

    const emails: string[] = [];

    alternatives.forEach(alternative => {
      const answers = alternative.getDataValue('answers');
      const answerEmails = answers.map(({ email }) => email);
      emails.push(...answerEmails);
    });

    return new Set(emails).size;
  }

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;
}
