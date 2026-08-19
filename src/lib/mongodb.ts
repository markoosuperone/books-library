import { MongoClient, ServerApiVersion } from 'mongodb';
import { env } from './env';

/**
 * The client connects lazily and the connection promise is cached.
 *
 * Connecting at module scope rejected at *import* time whenever the cluster was
 * unreachable, which surfaced as a process-level unhandledRejection before any
 * request had actually asked for the database.
 */
let connection: Promise<MongoClient> | null = null;

const createClient = (): MongoClient =>
  new MongoClient(env.MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

/**
 * Resolves to a connected client, or rejects with the connection error.
 * Callers must handle rejection - see the GraphQL resolvers.
 */
export const getMongoClient = async (): Promise<MongoClient> => {
  if (!connection) {
    connection = createClient()
      .connect()
      .catch((error: unknown) => {
        // Drop the cached rejection so a later request can retry, rather than
        // every future call being wedged behind one failed attempt.
        connection = null;
        throw error;
      });
  }

  return connection;
};

/**
 * Reports whether the database answers a ping. Never throws, and never closes
 * the shared client - callers use it to log or degrade, not to gate startup.
 */
export const isMongoReachable = async (): Promise<boolean> => {
  try {
    const client = await getMongoClient();
    await client.db('books').command({ ping: 1 });
    return true;
  } catch (error) {
    console.error(
      'MongoDB is unreachable:',
      error instanceof Error ? error.message : error
    );
    return false;
  }
};
