export const typeDefs = `#graphql
  type Movie {
    id: ID!
    title: String!
    type: String!
    year: String!
    poster: String!
    genre: [String!]!
    director: String!
    imdb_rating: Float!
    description: String!
    runtime: String!
    language: String!
    country: String!
    trailer: String
  }

  type Query {
    movies: [Movie!]!
    movie(id: ID!): Movie
    moviesByGenre(genre: String!): [Movie!]!
    searchMovies(query: String!): [Movie!]!
    topRatedMovies(limit: Int): [Movie!]!
    latestMovies(limit: Int): [Movie!]!
  }
`;