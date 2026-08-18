import { clientPromise } from "@/lib/mongodb";
import { GoogleBookVolume } from "@/models/booksData";

const resolvers = {
    Query: {
      books: () => {
        return [{ id: "hello user", volumeInfo: { title: "sample book" } }];
      },
    },
    Mutation: {
      createBooks: async (_: unknown, booksCollection: GoogleBookVolume[]) => {
        console.log("Received booksCollection:", booksCollection);
        const client = await clientPromise;
        const db = client.db('books');
        const collection = db.collection('books');
        await collection.insertMany(booksCollection);
        return booksCollection;
      },
    },
  };
  
  export default resolvers;