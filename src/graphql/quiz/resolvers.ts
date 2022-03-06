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
      const [quiz, userInvites] = await Promise.all([
        Quiz.findByPk(id, { rejectOnEmpty: true }),
        Invite.findAll({
          where: { email, quizId: id }
        })
      ]);

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
    ): Promise<Result[] | null> => {
      auth(userId);
      return Result.findAll({
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

      const createdQuiz = Quiz.create(
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

      return createdQuiz;
    },

    addResult: async (
      _root: unknown,
      { quizId, answers }: { quizId: number; answers: AnswerInput[] },
      { userId, email }: { userId: number; email: string }
    ): Promise<Result | null> => {
      const [quiz, userInvites] = await Promise.all([
        Quiz.findByPk(quizId),
        Invite.findAll({
          where: { email, quizId }
        })
      ]);

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

      const createdResult = await Result.create(
        { userId, quizId, answers },
        {
          include: [Answer]
        }
      );

      return createdResult;
    },

    updateQuestion: async (
      _root: unknown,
      { id, query }: { id: number; query: string }
    ): Promise<Question | undefined> => {
      const question = await Question.findByPk(id);

      const newData = {
        query: query || question?.query
      };

      // eslint-disable-next-line no-unused-expressions
      question?.set(newData);

      const newQuestion = await question?.save();

      return newQuestion;
    },

    updateAlternative: async (
      _root: unknown,
      { id, text, isRight }: { id: number; text: string; isRight: boolean }
    ): Promise<Alternative | undefined> => {
      const alternative = await Alternative.findByPk(id);

      const newData = {
        text: text || alternative?.text,
        isRight: isRight || alternative?.isRight
      };

      // eslint-disable-next-line no-unused-expressions
      alternative?.set(newData);

      const newAlternative = await alternative?.save();

      return newAlternative;
    },

    updateQuiz: async (
      _root: unknown,
      {
        id,
        title,
        isPublic,
        showPartial,
        dtExpiration
      }: {
        id: number;
        title: string;
        isPublic: boolean;
        showPartial: boolean;
        dtExpiration: string;
      }
    ): Promise<Quiz | undefined> => {
      const quiz = await Quiz.findByPk(id);

      const newData = {
        title: title || quiz?.title,
        isPublic: isPublic || quiz?.isPublic,
        showPartial: showPartial || quiz?.showPartial,
        dtExpiration: dtExpiration || quiz?.dtExpiration
      };

      // eslint-disable-next-line no-unused-expressions
      quiz?.set(newData);

      const newQuiz = await quiz?.save();

      return newQuiz;
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
