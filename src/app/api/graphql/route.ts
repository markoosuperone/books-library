import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";
import resolvers from "./resolvers";
import typeDefs from "./shema";
import { isMongoReachable } from "@/lib/mongodb";

// Startup probe, for visibility only. It deliberately does not close the shared
// client and does not block the route from being served: an unreachable
// database should fail the mutations that need it, not the whole endpoint.
void isMongoReachable();

const server = new ApolloServer({
  resolvers,
  typeDefs,
});

const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req, res) => ({
    req,
    res,
  }),
});

export async function POST(request: NextRequest) {
  return handler(request);
}
