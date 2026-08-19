import ThemeToggle from '../ThemeToggle/ThemeToggle';
import styles from './Header.module.scss';
import Link from 'next/link';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1>Book Library</h1>
      <div className={styles.spacer} />
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>
      <div className={styles.navLinks}>
        <Link href="/">Home</Link>
        <Link href="/books">Books</Link>
        <Link href="/favorites">Favorites</Link>
      </div>
    </header>
  );
};

export default Header;