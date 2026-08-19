const typeDefs = `#graphql

type ImageLinks {
  smallThumbnail: String
  thumbnail: String
}

type VolumeInfo {
  title: String
  subtitle: String
  authors: [String!]
  description: String
  pageCount: Int
  maturityRating: String
  imageLinks: ImageLinks
}

type GoogleBooksResponse {
  id: ID!
  volumeInfo: VolumeInfo
}

input ImageLinksInput {
  smallThumbnail: String
  thumbnail: String
}

input VolumeInfoInput {
  title: String
  subtitle: String
  authors: [String!]
  description: String
  pageCount: Int
  maturityRating: String
  imageLinks: ImageLinksInput
}

input GoogleBooksResponseInput {
  id: ID!
  volumeInfo: VolumeInfoInput
}

type Query {
  favoriteBooks: [GoogleBooksResponse]
  favoriteBook(id: ID!): GoogleBooksResponse
}

  type Mutation {
    addFavoriteBook(input: GoogleBooksResponseInput): GoogleBooksResponse
    updateFavoriteBook(id: ID!, input: GoogleBooksResponseInput): GoogleBooksResponse
    removeFavoriteBook(id: ID!): GoogleBooksResponse
  }


`;

export default typeDefs;
