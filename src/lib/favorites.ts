import "server-only";

import { getMongoClient } from "./mongodb";
import type { GoogleBookVolume } from "@/models/booksData";

const DB_NAME = "books";
const COLLECTION = "books";

/**
 * Reads one saved favorite straight from MongoDB.
 *
 * Server components read the database directly rather than calling our own
 * GraphQL route over HTTP: a server-to-self request would need an absolute URL,
 * which is exactly the localhost trap the client code has to avoid.
 *
 * Returns null when the book is not saved. A connection failure throws, so an
 * outage surfaces as an error rather than masquerading as "not found".
 */
export const getFavorite = async (
  id: string
): Promise<GoogleBookVolume | null> => {
  const client = await getMongoClient();

  const document = await client
    .db(DB_NAME)
    .collection<GoogleBookVolume>(COLLECTION)
    .findOne({ id }, { projection: { _id: 0 } });

  return document as GoogleBookVolume | null;
};
