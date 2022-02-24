import { AuthenticationError } from 'apollo-server-express';
import CryptoJS from 'crypto-js';
import { Response } from 'express';
import jwt from 'jsonwebtoken';

import { User } from '../../models';
import { auth } from '../quiz/resolvers';

export const COOKIE_NAME = '_JWT_COOKIE';

export const tokenize = (email: string, userId: string): string =>
  jwt.sign({ email, userId }, process.env.SECRET_KEY ?? 'secret', {
    expiresIn: '1d'
  });

export const encrypt = (pwd: string): string => CryptoJS.SHA256(pwd).toString();

const resolvers = {
  Mutation: {
    login: async (
      _root: unknown,
      { email, password }: { email: string; password: string },
      { res }: { res: Response }
    ): Promise<User> => {
      const user = await User.findOne({ where: { email } });
      if (!user) throw new AuthenticationError('Email does not exist');

      const encrypted = encrypt(password);

      const isValid = encrypted === user.password;

      if (!isValid) throw new AuthenticationError('Password incorrect');

      const token = tokenize(user.email, user.id);

      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
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

      const newuser = await User.create({
        name,
        email,
        password: encrypt(password)
      });

      return newuser;
    },

    updateUser: async (
      _root: unknown,
      {
        name,
        email,
        password
      }: { name: string; email: string; password: string },
      { userId }: { userId: number }
    ): Promise<User | undefined> => {
      const user = await User.findByPk(userId);

      const newData = {
        name: name || user?.name,
        email: email || user?.email,
        password: password ? encrypt(password) : user?.password
      };

      // eslint-disable-next-line no-unused-expressions
      user?.set(newData);

      const newuser = await user?.save();

      return newuser;
    }
  },

  Query: {
    me: async (
      _root: unknown,
      _p: unknown,
      { userId }: { userId: number }
    ): Promise<User | null> => {
      auth(userId);

      return User.findByPk(userId);
    }
  }
};

export default resolvers;
