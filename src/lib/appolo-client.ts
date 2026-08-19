import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { GRAPHQL_ENDPOINT } from "./constants";

const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: "same-origin",
});
export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: httpLink,
});
