import { addPoll, addVote } from './mutations';
import { poll, polls } from './queries';

const resolvers = {
  Query: {
    poll,
    polls
  },
  Mutation: {
    addPoll,
    addVote
  }
};

export default resolvers;
