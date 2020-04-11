import { addPoll, addAnswer } from './mutations';
import { poll, polls } from './queries';

const resolvers = {
  Query: {
    poll,
    polls
  },
  Mutation: {
    addPoll,
    addAnswer
  }
};

export default resolvers;
