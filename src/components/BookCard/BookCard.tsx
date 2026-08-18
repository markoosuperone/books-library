import styles from './BookCard.module.scss';

interface BookCardProps {
  title: string;
  author: string;
  imageUrl?: string;
}

const BookCard = ({ title, author, imageUrl }: BookCardProps) => {
  return <div className={styles.bookCardContainer}>
    <img className={styles.bookAvatar} src={imageUrl || '/placeholder-book.png'} alt={`${title} cover`} />
    <h3 className={styles.title}>{title}</h3>
    <p className={styles.author}>{author}</p>
  </div>;
};
export default BookCard;
