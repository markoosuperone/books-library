import ThemeToggle from '../ThemeToggle/ThemeToggle';
import styles from './Header.module.scss';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1>Book Library</h1>
      <div className={styles.spacer} />
      <div className={styles.themeToggle}>
        <ThemeToggle />
      </div>
      <div className={styles.navLinks}>
        <a href="/">Home</a>
        <a href="/books">Books</a>
        <a href="/favorites">Favorites</a>
      </div>
    </header>
  );
};

export default Header;