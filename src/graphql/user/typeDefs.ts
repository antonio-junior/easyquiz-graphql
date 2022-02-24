import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    quizes: [Quiz!]
  }

  type Mutation {
    addUser(name: String, email: String, password: String): User
    updateUser(id: ID!, name: String, email: String, password: String): User
    login(email: String!, password: String!): User
    logout: Boolean
  }

  type Query {
    me: User
  }
`;

export default typeDefs;
