import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Quiz {
    id: ID!
    title: String!
    uuid: String
    status: String
    isPublic: Boolean
    showPartial: Boolean
    dtExpiration: String
    questions: [Question!]!
    owner: User!
  }

  type Question {
    id: ID!
    query: String!
    alternatives: [Alternative!]!
  }

  type Alternative {
    id: ID!
    text: String!
    isRight: Boolean
  }

  type Result {
    id: ID!
    user: User!
    quiz: Quiz!
    answers: [Answer!]!
  }

  type Answer {
    alternatives: [Alternative]!
    question: Question!
  }

  type Query {
    quiz(id: ID!): Quiz
    userQuizes(userId: ID!): [Quiz]!
    quizes: [Quiz]!
  }

  input AlternativeInput {
    text: String!
    isRight: Boolean
  }

  input QuestionInput {
    query: String!
    alternatives: [AlternativeInput]!
  }

  input AnswerInput {
    questionId: ID!
    alternatives: [Int]!
  }

  type Invite {
    quizId: ID!
    email: String!
  }

  type Mutation {
    addInvite(quizId: ID!, email: String!): Quiz!
    addQuiz(
      title: String!
      isPublic: Boolean!
      showPartial: Boolean!
      expiration: String
      questions: [QuestionInput]!
    ): Quiz
    addResult(quizId: ID!, answers: [AnswerInput]!): Result
  }

  type Query {
    quiz: Quiz
    answeredQuizes: [Quiz!]
    publicQuizes: [Quiz!]
    myQuizes: [Quiz!]
    availableToAnswer: [Quiz!]
  }

  type Subscription {
    invited(email: String!): Quiz!
  }
`;

export default typeDefs;
