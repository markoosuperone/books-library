import { getVolumePage } from "@/lib/google-books";
import BookCard from "../../components/BookCard/BookCard";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./BooksPage.module.scss";
import Link from "next/link";

export const revalidate = 60;

/**
 * The Books API has no "list everything" endpoint: `q` is required and `q=*`
 * matches nothing. A broad subject query is the closest available stand-in for
 * a full catalogue - change this to widen or narrow what the page shows.
 */
const CATALOGUE_QUERY = "subject:fiction";

const parsePage = (raw?: string): number => {
  const parsed = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

const BooksPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) => {
  const { page: rawPage } = await searchParams;
  const { volumes, page, hasPrevious, hasNext } = await getVolumePage(
    CATALOGUE_QUERY,
    { page: parsePage(rawPage), revalidate }
  );

  return (
    <div className={styles.main}>
      <div className={styles.header}>My Book Collection</div>
      <div className={styles.booksContainer}>
        {volumes.length === 0 && (
          <div>
            {hasPrevious
              ? "No more books on this page."
              : "Books are temporarily unavailable."}
          </div>
        )}
        {volumes.map((book) => {
          return (
            <Link href={`/books/${book.id}`} key={book.id}>
              <BookCard
                book={book}
              />
            </Link>
          );
        })}
      </div>
      <Pagination
        page={page}
        hasPrevious={hasPrevious}
        hasNext={hasNext}
        basePath="/books"
      />
    </div>
  );
};

export default BooksPage;
