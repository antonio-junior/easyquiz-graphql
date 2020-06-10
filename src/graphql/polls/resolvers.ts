import { PubSub, AuthenticationError } from 'apollo-server-express';
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
  isright: boolean;
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

const USER_INVITED = 'USER_INVITED';

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

      if (!pollSet?.ispublic && !invitesPollSetIds.includes(id)) {
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
        where: { ispublic: true }
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
            { ispublic: true },
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
      { userId, pubSub }: { userId: number; pubSub: PubSub }
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

      pollSets.map(pollSet =>
        pubSub.publish(USER_INVITED, { invited: pollSet })
      );

      return added.length > 0;
    },
    addPoll: (
      _root: unknown,
      {
        title,
        ispublic,
        partial,
        expiration,
        userId,
        polls
      }: {
        title: string;
        ispublic: boolean;
        partial: boolean;
        expiration: string;
        userId: number;
        polls: PollInput[];
      }
    ): Promise<PollSet> => {
      const expirationDate = moment.parseZone(expiration, 'DD-MM-YYYY hh:mm');

      polls.forEach(({ maxselections, alternatives, question }) => {
        if (maxselections > alternatives.length)
          throw new Error('Max selections ccanot be greater than alternatives');

        if (alternatives.every(alt => alt.isright === false)) {
          throw new Error(
            `'${question}' should have at least one right Alternative`
          );
        }
      });

      return PollSet.create(
        {
          title,
          uuid: '',
          status: PollSet.Status.ACTIVE,
          ispublic,
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
  },

  Subscription: {
    invited: {
      subscribe: (
        _root: unknown,
        _p: unknown,
        { pubSub }: { pubSub: PubSub }
      ): AsyncIterator<string> => pubSub.asyncIterator<string>([USER_INVITED])
    }
  }
};

export default resolvers;
