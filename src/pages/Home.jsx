import { useState, useEffect, useCallback, useRef } from 'react';
import MovieCard from '../components/MovieCard/MovieCard';
import Preloader from '../components/Preloader/Preloader';
import styles from './Home.module.css';

const API_CONFIG = {
  KEY: '578a5673',
  URL: 'https://www.omdbapi.com/',
  DEFAULT_SEARCH: 'Matrix',
  DEBOUNCE_DELAY: 500,
  MIN_LOADING_TIME: 1000
};

export default function Home() {
  const [state, setState] = useState({
    movies: [],
    searchTerm: API_CONFIG.DEFAULT_SEARCH,
    type: 'all',
    loading: false,
    error: null
  });

  const loadingStartTime = useRef(0);
  const abortController = useRef(new AbortController());

  const fetchMovies = useCallback(async (title, type = '', signal) => {
    try {
      const response = await fetch(
        `${API_CONFIG.URL}?apikey=${API_CONFIG.KEY}&s=${title}${type ? `&type=${type}` : ''}`,
        { signal }
      );
      if (!response.ok) throw new Error('Ошибка сети');
      return await response.json();
    } catch (err) {
      if (err.name !== 'AbortError') {
        throw new Error('Ошибка соединения с API');
      }
    }
  }, []);

  const handleSearch = useCallback(async (signal) => {
    if (!state.searchTerm.trim()) return;
    
    loadingStartTime.current = Date.now();
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await fetchMovies(state.searchTerm, state.type !== 'all' ? state.type : '', signal);
      
      // Рассчитываем оставшееся время до минимального времени загрузки
      const elapsed = Date.now() - loadingStartTime.current;
      const remainingTime = Math.max(0, API_CONFIG.MIN_LOADING_TIME - elapsed);

      await new Promise(resolve => setTimeout(resolve, remainingTime));
      
      if (data?.Response === 'True') {
        setState(prev => ({ ...prev, movies: data.Search || [], loading: false }));
      } else {
        setState(prev => ({
          ...prev,
          movies: [],
          loading: false,
          error: data?.Error || 'Фильмы не найдены'
        }));
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message
        }));
      }
    }
  }, [state.searchTerm, state.type, fetchMovies]);

  useEffect(() => {
    abortController.current.abort();
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    const timer = setTimeout(() => {
      handleSearch(signal);
    }, API_CONFIG.DEBOUNCE_DELAY);

    return () => {
      clearTimeout(timer);
      abortController.current.abort();
    };
  }, [state.searchTerm, state.type, handleSearch]);

  const handleInputChange = (e) => {
    setState(prev => ({ ...prev, searchTerm: e.target.value }));
  };

  const handleTypeChange = (type) => {
    setState(prev => ({ ...prev, type }));
  };

  const handleRetry = () => {
    setState(prev => ({
      ...prev,
      searchTerm: API_CONFIG.DEFAULT_SEARCH,
      error: null
    }));
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.contentContainer}>
        <div className={styles.searchSection}>
          <div className={styles.searchControls}>
            <input
              type="text"
              value={state.searchTerm}
              onChange={handleInputChange}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(abortController.current.signal)}
              placeholder="Введите название фильма..."
              aria-label="Поиск фильмов"
              className={styles.searchInput}
            />
            
            <button 
              onClick={() => handleSearch(abortController.current.signal)}
              disabled={state.loading}
              className={styles.searchButton}
            >
              {state.loading ? 'Поиск...' : 'Поиск'}
            </button>
          </div>
          
          <div className={styles.filterGroup}>
            {['all', 'movie', 'series'].map((filterType) => (
              <label 
                key={filterType} 
                className={`${styles.filterLabel} ${state.loading ? styles.disabled : ''}`}
              >
                <input 
                  type="radio"
                  name="type"
                  checked={state.type === filterType}
                  onChange={() => handleTypeChange(filterType)}
                  className={styles.filterInput}
                  disabled={state.loading}
                />
                {filterType === 'all' ? 'Все' : filterType === 'movie' ? 'Фильмы' : 'Сериалы'}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.resultsContainer}>
          {state.loading ? (
            <Preloader />
          ) : state.error ? (
            <div className={styles.errorMessage}>
              <p>{state.error}</p>
              {state.error === 'Фильмы не найдены' && (
                <button 
                  onClick={handleRetry}
                  className={styles.retryButton}
                >
                  Показать популярные фильмы
                </button>
              )}
            </div>
          ) : (
            <div className={styles.moviesGrid}>
              {state.movies.map(movie => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}