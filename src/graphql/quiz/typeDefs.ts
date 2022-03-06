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
    correctAlternatives: [Int!]!
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
    answers: [Answer!]!
  }

  type Answer {
    choice: Alternative!
    question: Question!
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
    choice: Int!
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
    updateQuiz(
      id: ID!
      title: String
      isPublic: Boolean
      showPartial: Boolean
      dtExpiration: String
    ): Quiz!
    updateQuestion(id: ID!, query: String!): Question!
    updateAlternative(id: ID!, text: String, isRight: Boolean): Alternative!
  }

  type Query {
    quiz(id: ID!): Quiz
    answeredQuizes: [Quiz!]
    publicQuizes: [Quiz!]
    myQuizes: [Quiz!]
    availableToAnswer: [Quiz!]
    result(id: ID!): [Result]
  }

  type Subscription {
    invited(email: String!): Quiz!
  }
`;

export default typeDefs;
