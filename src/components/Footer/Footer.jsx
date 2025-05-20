import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>by sw1tchblade © {new Date().getFullYear()}</p>
    </footer>
  );
}