import { AuthenticationError } from 'apollo-server';
import * as moment from 'moment';

import { Answer, Poll, PollSet } from '../../models';

interface AnswerInput {
  alternativeId: number;
  email: string;
}

interface AlternativeInput {
  description: string;
}

interface PollInput {
  question: string;
  maxselections: number;
  rightanswer: number;
  alternatives: AlternativeInput[];
}

const auth = (userId: number): void => {
  if (!userId) throw new AuthenticationError('Must be authenticated.');
};

const resolvers = {
  Query: {
    poll: async (
      _root: unknown,
      { id }: { id: number },
      { loggedUserId }: { loggedUserId: number }
    ): Promise<PollSet> => {
      const pollSet = await PollSet.findByPk(id, { rejectOnEmpty: true });

      if (!pollSet?.allowpublic && loggedUserId === 0) {
        throw new AuthenticationError('Not Authorized');
      }

      return pollSet;
    },
    myPollSets: (
      _root: unknown,
      _p: unknown,
      { id }: { id: number }
    ): Promise<PollSet[]> => {
      auth(id);

      return PollSet.findAll({
        where: { userId: id }
      });
    }
  },

  Mutation: {
    addPoll: (
      _root: unknown,
      {
        title,
        allowpublic,
        partial,
        expiration,
        userId,
        polls
      }: {
        title: string;
        allowpublic: boolean;
        partial: boolean;
        expiration: string;
        userId: number;
        polls: PollInput[];
      }
    ): Promise<PollSet> => {
      const expirationDate = moment.parseZone(expiration, 'DD-MM-YYYY hh:mm');

      return PollSet.create(
        {
          title,
          uuid: '',
          status: PollSet.Status.ACTIVE,
          allowpublic,
          partial,
          userId,
          expiration: expirationDate.isValid() ? expirationDate : null,
          polls
        },
        {
          include: [Poll]
        }
      );
    },

    addAnswer: async (
      _root: unknown,
      { answers }: { answers: AnswerInput[] }
    ): Promise<boolean> => {
      const added = await Answer.bulkCreate(answers);

      return added.length > 0;
    }
  }
};

export default resolvers;
