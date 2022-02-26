import { PubSub, AuthenticationError } from 'apollo-server-express';
import { withFilter } from 'graphql-subscriptions';
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
  choice: number;
}

interface AlternativeInput {
  text: string;
  isRight: boolean;
}

interface QuestionInput {
  query: string;
  alternatives: AlternativeInput[];
}

export const auth = (userId: number): void => {
  if (!userId) throw new AuthenticationError('Must be authenticated.');
};

const USER_INVITED = 'USER_INVITED';

const resolvers = {
  Quiz: {
    owner: async (quiz: Quiz): Promise<User | null> =>
      User.findByPk(quiz.userId) || null
  },
  Result: {
    user: async (result: Result): Promise<User | null> =>
      User.findByPk(result.userId) || null
  },
  Question: {
    correctAlternatives: async (question: Question): Promise<number[]> => {
      const alternatives = await Alternative.findAll({
        where: { questionId: question.id, isRight: true }
      });
      return alternatives.map(a => a.id);
    }
  },
  Answer: {
    choice: async (answer: Answer): Promise<Alternative | null> =>
      Alternative.findByPk(answer.choice) || null,
    question: async (answer: Answer): Promise<Question | null> =>
      Question.findByPk(answer.questionId) || null
  },
  Query: {
    quiz: async (
      _root: unknown,
      { id }: { id: number },
      { userId, email }: { userId: number; email: string }
    ): Promise<Quiz> => {
      const quiz = await Quiz.findByPk(id, { rejectOnEmpty: true });
      const userInvites = await Invite.findAll({
        where: { email, quizId: id }
      });

      if (
        quiz.userId !== userId &&
        !quiz.isPublic &&
        userInvites.length === 0
      ) {
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
    publicQuizes: async (): Promise<Quiz[] | null> => {
      return Quiz.findAll({
        where: { isPublic: true }
      });
    },
    myQuizes: async (
      _root: unknown,
      _p: unknown,
      { userId }: { userId: number }
    ): Promise<Quiz[] | null> => {
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
            { isPublic: true },
            {
              id: {
                [Op.in]: quizIdsInvited
              }
            }
          ]
        }
      });
    },
    result: async (
      _root: unknown,
      { id }: { id: number },
      { userId }: { userId: number }
    ): Promise<Result | null> => {
      auth(userId);
      return Result.findOne({
        where: { quizId: id }
      });
    }
  },

  Mutation: {
    addInvite: async (
      _root: unknown,
      { quizId, email }: { quizId: number; email: string },
      { userId, pubSub }: { userId: number; pubSub: PubSub }
    ): Promise<Quiz> => {
      auth(userId);

      const quiz = await Quiz.findByPk(quizId);

      // user can only invite to quizes that he created
      if (quiz?.userId !== userId) throw new Error('Not authorized.');

      const alreadyInvited = await Invite.findAndCountAll({
        where: { quizId, email }
      });

      if (alreadyInvited.count) throw new Error('User already invited.');

      await Invite.create({ quizId, email });

      pubSub.publish(USER_INVITED, { invited: { quiz, email } });

      return quiz;
    },
    addQuiz: async (
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
    ): Promise<Quiz | null> => {
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
      { userId, email }: { userId: number; email: string }
    ): Promise<Result> => {
      const quiz = await Quiz.findByPk(quizId);
      const userInvites = await Invite.findAll({
        where: { email, quizId }
      });

      if (
        quiz?.userId !== userId &&
        !quiz?.isPublic &&
        userInvites.length === 0
      ) {
        throw new AuthenticationError('Not Authorized');
      }

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
      subscribe: withFilter(
        (
          _root: unknown,
          _p: unknown,
          { pubSub }: { pubSub: PubSub }
        ): AsyncIterator<string> =>
          pubSub.asyncIterator<string>([USER_INVITED]),
        (payload, { email }) => {
          return payload.invited.email === email;
        }
      ),
      resolve: ({ invited: { quiz } }: { invited: InvitePayload }): Quiz => {
        return quiz;
      }
    }
  }
};

type InvitePayload = {
  quiz: Quiz;
  email: string;
};

export default resolvers;
