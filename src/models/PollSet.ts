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
  uuid!: string;

  @Column(DataType.TEXT)
  status!: string;

  @Column(DataType.BOOLEAN)
  allowpublic?: boolean;

  @Column(DataType.BOOLEAN)
  partial!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

  @IsAfter(TODAY)
  @Column(DataType.DATE)
  expiration?: Date;

  get dtExpiration(): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    };

    return new Intl.DateTimeFormat('pt-BR', options).format(
      this.getDataValue('expiration')
    );
  }

  @HasMany(() => Poll, 'pollSetId')
  polls!: Poll[];

  get totalAnswers(): number {
    const [poll] = this.getDataValue('polls');
    const alternatives = poll.getDataValue('alternatives');

    return alternatives.reduce((acc, alternative) => {
      const answers = alternative.getDataValue('answers');
      const uniqueAnswers = new Set(answers.map(({ email }) => email));
      return acc + uniqueAnswers.size;
    }, 0);
  }

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;
}