import { PubSub, AuthenticationError } from 'apollo-server-express';
import * as moment from 'moment';
import { Op } from 'sequelize';

import {
  Invite,
  Question,
  Quiz,
  User,
  Result,
  Alternative,
  Answer
} from '../../models';

interface AnswerInput {
  questionId: number;
  alternatives: number[];
}

interface AlternativeInput {
  text: string;
  isRight: boolean;
}

interface QuestionInput {
  query: string;
  alternatives: AlternativeInput[];
}

const auth = (userId: number): void => {
  if (!userId) throw new AuthenticationError('Must be authenticated.');
};

const USER_INVITED = 'USER_INVITED';

const resolvers = {
  Quiz: {
    owner: (quiz: Quiz): Promise<User> => User.findByPk(quiz.userId)
  },
  Result: {
    quiz: (result: Result): Promise<Quiz> => Quiz.findByPk(result.quizId)
  },
  Query: {
    quiz: async (
      _root: unknown,
      { id }: { id: number },
      { email }: { email: string }
    ): Promise<Quiz> => {
      const quiz = await Quiz.findByPk(id, { rejectOnEmpty: true });
      const userInvites = await Invite.findAll({
        where: { email, quizId: id }
      });

      if (!quiz.isPublic && userInvites.length === 0) {
        throw new AuthenticationError('Not Authorized');
      }

      return quiz;
    },
    answeredQuizes: async (
      _root: unknown,
      _p: unknown,
      { userId }: { userId: number }
    ): Promise<Quiz[]> => {
      auth(userId);

      return Quiz.findAll({
        include: [
          {
            model: Question,
            required: true,
            include: [
              {
                model: Alternative,
                required: true
              }
            ]
          },
          {
            model: Result,
            required: true,
            where: { userId }
          }
        ]
      });
    },
    publicQuizes: (): Promise<Quiz[]> => {
      return Quiz.findAll({
        where: { isPublic: true }
      });
    },
    myQuizes: (
      _root: unknown,
      _p: unknown,
      { userId }: { userId: number }
    ): Promise<Quiz[]> => {
      auth(userId);

      return Quiz.findAll({
        where: { userId }
      });
    },
    availableToAnswer: async (
      _root: unknown,
      _p: unknown,
      { userId, email }: { userId: number; email: string }
    ): Promise<Quiz[]> => {
      auth(userId);

      const invites = await Invite.findAll({ where: { email } });
      const quizIdsInvited = Array.from(new Set(invites.map(i => i.quizId)));

      return Quiz.findAll({
        where: {
          [Op.or]: [
            { ispublic: true },
            {
              id: {
                [Op.in]: quizIdsInvited
              }
            }
          ]
        }
      });
    }
  },

  Mutation: {
    addInvite: async (
      _root: unknown,
      { quizId, email }: { quizId: number; email: string },
      { userId, pubSub }: { userId: number; pubSub: PubSub }
    ): Promise<Invite> => {
      auth(userId);

      const quiz = await Quiz.findByPk(quizId);

      // user can only invite to quizes that he created
      if (quiz?.userId !== userId) throw new Error('Not authorized.');

      const added = await Invite.create({ quizId, email });

      pubSub.publish(USER_INVITED, { invited: quiz });

      return added;
    },
    addQuiz: (
      _root: unknown,
      {
        title,
        isPublic,
        showPartial,
        expiration,
        questions
      }: {
        title: string;
        isPublic: boolean;
        showPartial: boolean;
        expiration: string;
        questions: QuestionInput[];
      },
      { userId }: { userId: number }
    ): Promise<Quiz> => {
      auth(userId);

      const expirationDate = moment.parseZone(expiration, 'DD-MM-YYYY hh:mm');

      questions.forEach(({ alternatives, query }) => {
        if (alternatives.every(alt => alt.isRight === false)) {
          throw new Error(
            `Question '${query}' should have at least one right Alternative`
          );
        }
      });

      return Quiz.create(
        {
          title,
          status: Quiz.Status.ACTIVE,
          isPublic,
          showPartial,
          userId,
          expiration: expirationDate.isValid() ? expirationDate.toDate() : null,
          questions
        },
        {
          include: [Question]
        }
      );
    },

    addResult: async (
      _root: unknown,
      { quizId, answers }: { quizId: number; answers: AnswerInput[] },
      { userId }: { userId: number }
    ): Promise<Result> => {
      auth(userId);

      const result = await Result.findOne({
        where: {
          [Op.and]: [{ userId }, { quizId }]
        }
      });

      if (result) throw new Error('User already answered');

      return Result.create(
        { userId, quizId, answers },
        {
          include: [Answer]
        }
      );
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
