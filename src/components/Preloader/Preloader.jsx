import styles from './Preloader.module.css'; // Убедитесь, что файл существует

function Preloader() {
  return (
    <div className={styles.preloader}>
      {/* Ваш код прелоадера (например, анимация) */}
      <div className={styles.spinner}></div>
      <p>Загрузка...</p>
    </div>
  );
}

export default Preloader; // Критически важная строка