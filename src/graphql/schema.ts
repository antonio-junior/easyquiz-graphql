import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypeDefs } from 'graphql-tools-merge-typedefs';

import QuizResolvers from './quiz/resolvers';
import QuizTypeDef from './quiz/typeDefs';
import UserResolvers from './user/resolvers';
import UserTypeDef from './user/typeDefs';

export const resolvers = [UserResolvers, QuizResolvers];
export const typeDefs = [UserTypeDef, QuizTypeDef];

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs(typeDefs),
  resolvers
});

export default schema;
