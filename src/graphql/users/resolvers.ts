import { AuthenticationError } from 'apollo-server';
import bcrypt from 'bcrypt';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../../models';

export const COOKIE_NAME = '_JWT_COOKIE';

const resolvers = {
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
        { email: user.email, userId: user.id },
        process.env.SECRET_KEY ?? 'secret',
        { expiresIn: '1d' }
      );

      res.cookie(COOKIE_NAME, token, {
        httpOnly: true
      });

      return user;
    },

    logout: (
      _root: unknown,
      _args: unknown,
      { res }: { res: Response }
    ): boolean => {
      res.cookie(COOKIE_NAME, { expires: Date.now() });

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
