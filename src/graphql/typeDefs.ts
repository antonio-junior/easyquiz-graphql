import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    polls: [Poll!]
  }

  type Poll {
    id: ID!
    title: String!
    uuid: String!
    status: String!
    public: Boolean!
    multiple: Boolean!
    partial: Boolean!
    dtExpiration: String
    answers: [Answer!]!
    owner: User!
    totalVotes: Int!
  }

  type Vote {
    byMail: String
    byIP: String!
  }

  type Answer {
    id: ID!
    description: String!
    votes: [Vote!]
    countVotes: Int!
  }

  type Query {
    poll(id: ID!): Poll
    polls(userId: ID!): [Poll!]
  }

  type Mutation {
    addPoll(
      title: String!
      allowpublic: Boolean!
      multiple: Boolean!
      partial: Boolean!
      userId: ID!
      answers: [String]!
      expiration: String
    ): Poll
    addVote(answerId: ID!, mail: String, ip: String!): Answer
  }
`;

export default typeDefs;
