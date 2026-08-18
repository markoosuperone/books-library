import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from './env';

const client = new MongoClient(env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const clientPromise: Promise<MongoClient> = client.connect();

export { clientPromise };
