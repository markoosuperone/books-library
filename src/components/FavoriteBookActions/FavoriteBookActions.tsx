"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GRAPHQL_ENDPOINT } from "@/lib/constants";
import { GoogleBookVolume } from "@/models/booksData";
import styles from "./FavoriteBookActions.module.scss";

const UPDATE_FAVORITE = `
  mutation UpdateFavoriteBook($id: ID!, $input: GoogleBooksResponseInput) {
    updateFavoriteBook(id: $id, input: $input) {
      id
      volumeInfo {
        title
        description
      }
    }
  }
`;

const REMOVE_FAVORITE = `
  mutation RemoveFavoriteBook($id: ID!) {
    removeFavoriteBook(id: $id) {
      id
    }
  }
`;

const request = async (query: string, variables: Record<string, unknown>) => {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  const result = await response.json();

  // GraphQL reports failures in `errors` with an HTTP 200, so checking the
  // status alone would treat "already exists" or "not found" as a success.
  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  return result.data;
};

interface FavoriteBookActionsProps {
  book: GoogleBookVolume;
}

const FavoriteBookActions = ({ book }: FavoriteBookActionsProps) => {
  const router = useRouter();
  const [title, setTitle] = useState(book.volumeInfo.title ?? "");
  const [description, setDescription] = useState(
    book.volumeInfo.description ?? ""
  );
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (title.trim() === "") {
      // The collection validator requires volumeInfo.title, so catch it here
      // rather than letting the write fail server-side.
      setMessage("Title cannot be empty.");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      await request(UPDATE_FAVORITE, {
        id: book.id,
        input: {
          id: book.id,
          // Only the fields VolumeInfoInput declares - the schema rejects any
          // extras, and the resolver's `$set` replaces volumeInfo wholesale,
          // so anything omitted here would be dropped from the document.
          volumeInfo: {
            title: title.trim(),
            subtitle: book.volumeInfo.subtitle,
            authors: book.volumeInfo.authors,
            description: description.trim(),
            pageCount: book.volumeInfo.pageCount,
            maturityRating: book.volumeInfo.maturityRating,
            imageLinks: {
              smallThumbnail: book.volumeInfo.imageLinks?.smallThumbnail,
              thumbnail: book.volumeInfo.imageLinks?.thumbnail,
            },
          },
        },
      });

      setMessage("Saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Update failed.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    setBusy(true);
    setMessage(null);

    try {
      await request(REMOVE_FAVORITE, { id: book.id });
      router.push("/favorites");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
      setBusy(false);
    }
  };

  return (
    <div className={styles.actions}>
      <label className={styles.field}>
        <span className={styles.label}>Title</span>
        <input
          className={styles.input}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          disabled={busy}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Description</span>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={5}
          disabled={busy}
        />
      </label>

      <div className={styles.buttons}>
        <button className={styles.save} onClick={handleSave} disabled={busy}>
          Save changes
        </button>
        <button
          className={styles.remove}
          onClick={handleRemove}
          disabled={busy}
        >
          Remove from favorites
        </button>
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default FavoriteBookActions;
