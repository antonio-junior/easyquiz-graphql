import { gql } from 'apollo-server';

const typeDefs = gql`
  type PollSet {
    id: ID!
    title: String!
    uuid: String!
    status: String!
    allowpublic: Boolean!
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
    rightanswer: Int
    alternatives: [Alternative!]!
  }

  type Alternative {
    id: ID!
    description: String!
    answers: [Answer!]
    countVotes: Int!
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

  type Mutation {
    addPoll(
      title: String!
      allowpublic: Boolean
      partial: Boolean
      expiration: String
      userId: ID!
      polls: [PollInput]!
    ): PollSet
    addAnswer(answers: [AnswerInput]): Boolean
  }
`;

export default typeDefs;
