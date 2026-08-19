import { GoogleBookVolume } from "@/models/booksData";
import styles from "./BookCard.module.scss";
import { FALLBACK_COVER_SRC } from "@/lib/constants";
import AddBookToFavoriteButton from "../AddBookToFavoriteButton/AddBookToFavoriteButton";

interface BookCardProps {
  book: GoogleBookVolume;
  isFavorite?: boolean;
}

const BookCard = ({ book, isFavorite }: BookCardProps) => {
  const { title, authors } = book.volumeInfo;
  const imageUrl = book.volumeInfo.imageLinks?.thumbnail;
  const author = authors ? authors[0] : "no name";
  const hasCover = Boolean(imageUrl);

  return (
    <div className={styles.bookCardContainer}>
      <img
        className={styles.bookAvatar}
        src={imageUrl || FALLBACK_COVER_SRC}
        alt={hasCover ? `${title} cover` : `${title} - no cover available`}
      />
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.author}>{author}</p>
      {!isFavorite && (
        <AddBookToFavoriteButton book={book}  />
      )}
    </div>
  );
};
export default BookCard;
