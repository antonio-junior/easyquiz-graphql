import { gql } from 'apollo-server';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    pollsets: [PollSet!]
  }

  type Mutation {
    addUser(name: String, email: String, password: String): User
    login(email: String!, password: String!): User
    logout: Boolean
  }
`;

export default typeDefs;
