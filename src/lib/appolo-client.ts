import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

const httpLink = new HttpLink({
  uri: "http://localhost:3000/api/graphql",
  credentials: "same-origin",
});
export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
});
