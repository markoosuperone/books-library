import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";
import  resolvers  from "./resolvers";
import  typeDefs  from "./shema";
import { MongoClient, ServerApiVersion } from "mongodb";
import { clientPromise } from "@/lib/mongodb";





async function run() {
  try {
    const client = await clientPromise;
    await client.db("books").command({ ping: 1 });
  } finally {
    const client = await clientPromise;
    await client.close();
  }
}
run()

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