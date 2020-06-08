import { AuthenticationError } from 'apollo-server';
import bcrypt from 'bcrypt';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { PollSet, User } from '../../models';

const resolvers = {
  Query: {
    userPolls: (
      _root: unknown,
      { userId }: { userId: number },
      { loggedUserId }: { loggedUserId: number }
    ): Promise<PollSet[]> => {
      // user can edit only polls created by himself
      if (loggedUserId !== userId)
        throw new AuthenticationError('Not Authorized');

      return PollSet.findAll({ where: { userId } });
    }
  },

  Mutation: {
    login: async (
      _root: unknown,
      { email, password }: { email: string; password: string },
      { res }: { res: Response }
    ): Promise<User> => {
      const user = await User.findOne({ where: { email } });

      if (!user) throw new AuthenticationError('Email does not exist');

      const isValid = bcrypt.compareSync(password, user.password);

      if (!isValid) throw new AuthenticationError('Password incorrect');

      const token = jwt.sign(
        { email: user.email, id: user.id },
        process.env.SECRET_KEY ?? 'secret',
        { expiresIn: '1d' }
      );

      res.cookie('jwt', token, {
        httpOnly: true
      });

      return user;
    },

    logout: (
      _root: unknown,
      _args: unknown,
      { res }: { res: Response }
    ): boolean => {
      res.cookie('jwt', { expires: Date.now() });
      return true;
    },

    addUser: async (
      _root: unknown,
      {
        name,
        email,
        password
      }: { name: string; email: string; password: string }
    ): Promise<User> => {
      const user = await User.findOne({ where: { email } });
      if (user) throw new Error('Email already in use');

      const hash = bcrypt.hashSync(password, 10);

      const newuser = await User.create({ name, email, password: hash });

      return newuser;
    }
  }
};

export default resolvers;
