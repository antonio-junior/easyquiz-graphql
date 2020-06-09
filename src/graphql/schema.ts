import { makeExecutableSchema } from 'graphql-tools';
import { mergeTypeDefs } from 'graphql-tools-merge-typedefs';

import PollResolvers from './polls/resolvers';
import PollTypeDef from './polls/typeDefs';
import UserResolvers from './users/resolvers';
import UserTypeDef from './users/typeDefs';

const schema = makeExecutableSchema({
  typeDefs: mergeTypeDefs([UserTypeDef, PollTypeDef]),
  resolvers: [UserResolvers, PollResolvers]
});

export default schema;
