import { MongoClient, ServerApiVersion } from "mongodb";

/**
 * Idempotent database setup. Safe to run repeatedly.
 *
 * MongoDB creates collections implicitly on first write, so this script exists
 * for the two things it will *not* do on its own: enforce document shape, and
 * guarantee uniqueness.
 *
 * Run with: npm run db:setup
 */

const DB_NAME = "books";
const COLLECTION = "books";
const INDEX_NAME = "id_unique";

/**
 * `additionalProperties` is deliberately left open: MongoDB adds `_id` to every
 * document, and closing the shape would reject every insert.
 *
 * `pageCount` uses "number" rather than "int" because JavaScript has no integer
 * type - the driver writes whole numbers as BSON doubles, which an "int" rule
 * would reject.
 */
const validator = {
  $jsonSchema: {
    bsonType: "object",
    required: ["id", "volumeInfo"],
    properties: {
      id: {
        bsonType: "string",
        description: "Google Books volume id - must be unique",
      },
      volumeInfo: {
        bsonType: "object",
        required: ["title"],
        properties: {
          title: { bsonType: "string" },
          subtitle: { bsonType: "string" },
          authors: { bsonType: "array", items: { bsonType: "string" } },
          description: { bsonType: "string" },
          pageCount: { bsonType: "number" },
          maturityRating: { bsonType: "string" },
          imageLinks: {
            bsonType: "object",
            properties: {
              smallThumbnail: { bsonType: "string" },
              thumbnail: { bsonType: "string" },
            },
          },
        },
      },
    },
  },
};

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error(
    "MONGODB_URI is not set. Run via `npm run db:setup`, which loads .env.local."
  );
  process.exit(1);
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 15000,
});

/** Lists ids that already appear more than once, blocking a unique index. */
const findDuplicateIds = async (db: ReturnType<MongoClient["db"]>) => {
  const groups = await db
    .collection(COLLECTION)
    .aggregate([
      { $group: { _id: "$id", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $limit: 10 },
    ])
    .toArray();

  return groups.map((group) => `${String(group._id)} (x${group.count})`);
};

try {
  await client.connect();
  console.log(`connected to ${DB_NAME}`);

  const db = client.db(DB_NAME);
  const existing = await db.listCollections({ name: COLLECTION }).toArray();

  if (existing.length === 0) {
    await db.createCollection(COLLECTION, {
      validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`created  ${DB_NAME}.${COLLECTION} with schema validation`);
  } else {
    // The collection is already there, so the validator is updated in place -
    // re-creating it would throw NamespaceExists.
    await db.command({
      collMod: COLLECTION,
      validator,
      validationLevel: "strict",
      validationAction: "error",
    });
    console.log(`updated  ${DB_NAME}.${COLLECTION} schema validation`);
  }

  try {
    const name = await db
      .collection(COLLECTION)
      .createIndex({ id: 1 }, { unique: true, name: INDEX_NAME });
    console.log(`ensured  unique index "${name}" on { id: 1 }`);
  } catch (error) {
    const { code } = error as { code?: number };

    if (code === 11000) {
      const duplicates = await findDuplicateIds(db);
      console.error(
        `\nCannot create the unique index: duplicate ids already exist.\n` +
          `  ${duplicates.join("\n  ")}\n\n` +
          `Remove the duplicates, then run this script again.`
      );
      process.exit(1);
    }

    throw error;
  }

  const indexes = await db.collection(COLLECTION).indexes();
  console.log(
    `indexes: ${indexes.map((index) => index.name).join(", ")}`
  );
  console.log("\ndatabase setup complete");
} catch (error) {
  console.error(
    "database setup failed:",
    error instanceof Error ? error.message : error
  );
  process.exit(1);
} finally {
  await client.close();
}
