import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypeDefs } from 'graphql-tools-merge-typedefs';

import PollResolvers from './polls/resolvers';
import PollTypeDef from './polls/typeDefs';
import UserResolvers from './users/resolvers';
import UserTypeDef from './users/typeDefs';

export const resolvers = [UserResolvers, PollResolvers];
export const typeDefs = [UserTypeDef, PollTypeDef];

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs(typeDefs),
  resolvers
});

export default schema;
