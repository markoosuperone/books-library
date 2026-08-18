import Link from "next/link";
import styles from "./Pagination.module.scss";

interface PaginationProps {
  page: number;
  hasPrevious: boolean;
  hasNext: boolean;
  /** Route the page links point at, e.g. "/books". */
  basePath: string;
}

const Pagination = ({
  page,
  hasPrevious,
  hasNext,
  basePath,
}: PaginationProps) => {
  // The API gives no trustworthy total, so there is no final page to link to
  // and no page count to show - only whether a step in each direction exists.
  return (
    <nav className={styles.pagination} aria-label="Pagination">
      {hasPrevious ? (
        <Link className={styles.link} href={`${basePath}?page=${page - 1}`} rel="prev">
          Previous
        </Link>
      ) : (
        <span className={styles.disabled} aria-disabled="true">
          Previous
        </span>
      )}

      <span className={styles.status} aria-current="page">
        Page {page}
      </span>

      {hasNext ? (
        <Link className={styles.link} href={`${basePath}?page=${page + 1}`} rel="next">
          Next
        </Link>
      ) : (
        <span className={styles.disabled} aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  );
};

export default Pagination;
