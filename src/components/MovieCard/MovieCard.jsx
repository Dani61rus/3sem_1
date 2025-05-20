import styles from './MovieCard.module.css';

export default function MovieCard({ movie }) {
  const hasImage = movie.Poster && movie.Poster !== 'N/A';

  return (
    <div className={styles.card}>
      <div className={styles['image-container']}>
        <div className={styles['image-content']}>
          {hasImage ? (
            <img 
              src={movie.Poster}
              alt={movie.Title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className={styles.placeholder}>Изображение не найдено</div>
          )}
        </div>
      </div>
      
      <div className={styles['title-container']}>
        <h3 title={movie.Title}>{movie.Title}</h3>
      </div>
      
      <div className={styles.yearType}>
        <span>{movie.Year}</span>
        <span>{movie.Type === 'movie' ? 'Фильм' : 'Сериал'}</span>
      </div>
    </div>
  );
}