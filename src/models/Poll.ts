/* eslint-disable no-param-reassign */
import {
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

import Answer from './Answer';
import User from './User';

export enum Status {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED'
}

@DefaultScope(() => ({
  include: [Answer]
}))
@Table({
  tableName: 'polls'
})
export default class Poll extends Model<Poll> {
  @BeforeCreate
  static initValues(instance: Poll): void {
    instance.uuid = uuidv4();
    instance.status = Status.ACTIVE;
  }

  @Column(DataType.TEXT)
  title!: string;

  @Column(DataType.TEXT)
  uuid!: string;

  @Column(DataType.TEXT)
  status!: string;

  @Column(DataType.BOOLEAN)
  allowpublic!: boolean;

  @Column(DataType.BOOLEAN)
  multiple!: boolean;

  @Column(DataType.BOOLEAN)
  partial!: boolean;

  @CreatedAt
  @Column(DataType.DATE)
  createdAt!: Date;

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

  @HasMany(() => Answer, 'pollId')
  answers!: Answer[];

  get totalVotes(): number {
    const answers = this.getDataValue('answers');

    return answers.reduce((acc, answer) => {
      const votes = answer.getDataValue('votes') || [];
      return acc + votes.length;
    }, 0);
  }

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId!: number;
}
