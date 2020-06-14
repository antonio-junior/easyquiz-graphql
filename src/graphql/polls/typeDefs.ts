import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type PollSet {
    id: ID!
    title: String!
    uuid: String!
    status: String!
    ispublic: Boolean!
    partial: Boolean!
    dtExpiration: String
    polls: [Poll!]!
    owner: User!
    totalAnswers: Int!
  }

  type Poll {
    id: ID!
    question: String!
    maxselections: Int!
    alternatives: [Alternative!]!
  }

  type Alternative {
    id: ID!
    description: String!
    answers: [Answer!]
    countVotes: Int!
    isright: Boolean!
  }

  type Answer {
    email: String
  }

  type Query {
    poll(id: ID!): PollSet
    userPolls(userId: ID!): [PollSet!]
    pollsets: [PollSet!]
  }

  input AlternativeInput {
    description: String
    isright: Boolean
  }

  input PollInput {
    question: String!
    maxselections: Int
    rightanswer: Int
    alternatives: [AlternativeInput]!
  }

  input AnswerInput {
    alternativeId: ID!
    email: String
  }

  input InputInvite {
    email: String!
    pollsetId: ID!
  }

  type Mutation {
    addInvites(invites: [InputInvite]!): Boolean
    addPoll(
      title: String!
      ispublic: Boolean
      partial: Boolean
      expiration: String
      userId: ID!
      polls: [PollInput]!
    ): PollSet
    addAnswer(answers: [AnswerInput]): Boolean
  }

  type Query {
    myPollSets: [PollSet!]
    availableToAnswer: [PollSet!]
    publicPollSets: [PollSet!]
    votedPollSets: [PollSet!]
  }

  type Subscription {
    invited: PollSet!
  }
`;

export default typeDefs;
