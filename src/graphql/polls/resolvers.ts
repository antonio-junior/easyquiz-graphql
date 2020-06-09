import { AuthenticationError } from 'apollo-server';
import * as moment from 'moment';
import { Op } from 'sequelize';

import { Answer, Invite, Poll, PollSet, User, Alternative } from '../../models';

interface InviteInput {
  pollsetId: number;
  email: string;
}

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
  PollSet: {
    owner: (poll: PollSet): Promise<User> => User.findByPk(poll.userId)
  },
  Query: {
    poll: async (
      _root: unknown,
      { id }: { id: number },
      { email }: { email: string }
    ): Promise<PollSet> => {
      const pollSet = await PollSet.findByPk(id, { rejectOnEmpty: true });
      const userInvites = await Invite.findAll({ where: { email } });
      const invitesPollSetIds = userInvites.map(i => i.pollsetId);

      if (!pollSet?.allowpublic && !invitesPollSetIds.includes(id)) {
        throw new AuthenticationError('Not Authorized');
      }

      return pollSet;
    },
    votedPollSets: async (
      _root: unknown,
      _p: unknown,
      { userId, email }: { userId: number; email: string }
    ): Promise<PollSet[]> => {
      auth(userId);

      return PollSet.findAll({
        include: [
          {
            model: Poll,
            required: true,
            include: [
              {
                model: Alternative,
                required: true,
                include: [
                  {
                    model: Answer,
                    where: { email },
                    required: true
                  }
                ]
              }
            ]
          }
        ]
      });
    },
    publicPollSets: (): Promise<PollSet[]> => {
      return PollSet.findAll({
        where: { allowpublic: true }
      });
    },
    myPollSets: (
      _root: unknown,
      _p: unknown,
      { userId }: { userId: number }
    ): Promise<PollSet[]> => {
      auth(userId);

      return PollSet.findAll({
        where: { userId }
      });
    },
    available: async (
      _root: unknown,
      _p: unknown,
      { userId, email }: { userId: number; email: string }
    ): Promise<PollSet[]> => {
      auth(userId);

      const invites = await Invite.findAll({ where: { email } });
      const pollSetIds = Array.from(new Set(invites.map(i => i.pollsetId)));

      return PollSet.findAll({
        where: {
          [Op.or]: [
            { allowpublic: true },
            {
              id: {
                [Op.in]: pollSetIds
              }
            }
          ]
        }
      });
    }
  },

  Mutation: {
    addInvites: async (
      _root: unknown,
      { invites }: { invites: InviteInput[] },
      { userId }: { userId: number }
    ): Promise<boolean> => {
      auth(userId);

      const pollSetIds = Array.from(new Set(invites.map(i => i.pollsetId)));

      const pollSets = await PollSet.findAll({
        where: { id: { [Op.in]: pollSetIds } }
      });

      // user can only invite to pollSets that he created
      if (pollSets.some(p => p.userId !== userId))
        throw new Error('Not authorized.');

      const added = await Invite.bulkCreate(invites);

      return added.length > 0;
    },
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
