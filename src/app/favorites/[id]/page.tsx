import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getFavorite } from "@/lib/favorites";
import { FALLBACK_COVER_SRC } from "@/lib/constants";
import FavoriteBookActions from "@/components/FavoriteBookActions/FavoriteBookActions";
import styles from "./favoriteBookPage.module.scss";

/**
 * The saved copy of a book, read from MongoDB.
 *
 * Distinct from /books/[id], which shows Google's canonical record and is
 * read-only. This route owns the document the reader can edit or delete, so
 * the two stay correct even once an edited copy diverges from the original.
 */
const FavoriteBookPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const book = await getFavorite(id);

  if (!book) {
    notFound();
  }

  const { title, authors, description, imageLinks } = book.volumeInfo;

  return (
    <div className={styles.container}>
      <Link className={styles.back} href="/favorites">
        &larr; Back to favorites
      </Link>

      <h1 className={styles.title}>{title}</h1>
      <h3>{authors ? authors.join(", ") : "Unknown Author"}</h3>

      <Image
        src={imageLinks?.thumbnail ?? FALLBACK_COVER_SRC}
        alt={imageLinks?.thumbnail ? `${title} cover` : `${title} - no cover available`}
        className={styles.cover}
        width={300}
        height={400}
      />

      <p className={styles.description}>
        {description || "No description available."}
      </p>

      <FavoriteBookActions book={book} />
    </div>
  );
};

export default FavoriteBookPage;
