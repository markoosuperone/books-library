import { GraphQLError } from "graphql";
import { getMongoClient } from "@/lib/mongodb";
import { GoogleBookVolume } from "@/models/booksData";

const resolvers = {
  Query: {
    favoriteBooks: async () => {
      try {
        const client = await getMongoClient();
        const db = client.db("books");
        const collection = db.collection<GoogleBookVolume>("books");
        const books = await collection.find().toArray();
        return books;
      } catch (error) {
        // Without this the raw driver error - which quotes the connection
        // string - would travel back to the client in the GraphQL response.
        console.error("favoriteBooks failed:", error);
        throw new GraphQLError(
          "Could not load favorites: the database is unavailable.",
          { extensions: { code: "DATABASE_UNAVAILABLE" } },
        );
      }
    },
    favoriteBook: async (_: unknown, { id }: { id: string }) => {
      try {
        const client = await getMongoClient();
        const db = client.db("books");
        const collection = db.collection<GoogleBookVolume>("books");
        const book = await collection.findOne({ id });
        if (!book) {
          throw new GraphQLError("Book not found.", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        return book;
      } catch (error) {
        // The NOT_FOUND above is thrown inside this try, so without this guard
        // it would be swallowed and re-reported as a database outage.
        if (error instanceof GraphQLError) {
          throw error;
        }

        console.error("favoriteBook failed:", error);
        throw new GraphQLError(
          "Could not load the book: the database is unavailable.",
          { extensions: { code: "DATABASE_UNAVAILABLE" } },
        );
      }
    },
  },
  Mutation: {
    // GraphQL passes the field's arguments as one object, so the `input` list
    // has to be destructured out of it rather than used as the argument itself.
    addFavoriteBook: async (
      _: unknown,
      { input }: { input?: GoogleBookVolume },
    ) => {
      if (!input) {
        throw new GraphQLError("No book data provided.", {
          extensions: { code: "BAD_INPUT" },
        });
      }

      try {
        const client = await getMongoClient();
        await client.db("books").collection("books").insertOne(input);
        return input;
      } catch (error) {
        const { code } = error as { code?: number };

        // 11000: the unique index on `id` rejected a book already saved.
        if (code === 11000) {
          throw new GraphQLError("That book is already in your favorites.", {
            extensions: { code: "ALREADY_EXISTS" },
          });
        }

        // 121: the collection's schema validator rejected the document.
        if (code === 121) {
          throw new GraphQLError(
            "Book data does not match the expected shape.",
            {
              extensions: { code: "BAD_INPUT" },
            },
          );
        }

        // Logged in full server-side. The client gets a generic message so the
        // connection string cannot leak out through an error payload.
        console.error("addFavoriteBook failed:", error);
        throw new GraphQLError(
          "Could not save the book: the database is unavailable.",
          { extensions: { code: "DATABASE_UNAVAILABLE" } },
        );
      }
    },
    updateFavoriteBook: async (
      _: unknown,
      { id, input }: { id: string; input?: GoogleBookVolume },
    ) => {
      if (!input) {
        throw new GraphQLError("No book data provided.", {
          extensions: { code: "BAD_INPUT" },
        });
      }

      try {
        const client = await getMongoClient();
        const result = await client
          .db("books")
          .collection("books")
          .findOneAndUpdate(
            { id },
            { $set: input },
            { returnDocument: "after" },
          );

        if (!result) {
          throw new GraphQLError("Book not found.", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return result;
      } catch (error) {
        // The NOT_FOUND above is thrown inside this try, so without this guard
        // it would be swallowed and re-reported as a database outage.
        if (error instanceof GraphQLError) {
          throw error;
        }

        const { code } = error as { code?: number };

        // 11000: the unique index on `id` rejected a book already saved.
        if (code === 11000) {
          throw new GraphQLError("That book is already in your favorites.", {
            extensions: { code: "ALREADY_EXISTS" },
          });
        }

        // 121: the collection's schema validator rejected the document.
        if (code === 121) {
          throw new GraphQLError(
            "Book data does not match the expected shape.",
            {
              extensions: { code: "BAD_INPUT" },
            },
          );
        }

        // Logged in full server-side. The client gets a generic message so the
        // connection string cannot leak out through an error payload.
        console.error("updateFavoriteBook failed:", error);
        throw new GraphQLError(
          "Could not update the book: the database is unavailable.",
          { extensions: { code: "DATABASE_UNAVAILABLE" } },
        );
      }
    },
    removeFavoriteBook: async (_: unknown, { id }: { id: string }) => {
      try {
        const client = await getMongoClient();
        const result = await client
          .db("books")
          .collection("books")
          .findOneAndDelete({ id });

        if (!result) {
          throw new GraphQLError("Book not found.", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return result;
      } catch (error) {
        // Same guard as above: the NOT_FOUND is thrown inside this try.
        if (error instanceof GraphQLError) {
          throw error;
        }

        console.error("removeFavoriteBook failed:", error);
        throw new GraphQLError(
          "Could not remove the book: the database is unavailable.",
          { extensions: { code: "DATABASE_UNAVAILABLE" } },
        );
      }
    },
  },
};

export default resolvers;
