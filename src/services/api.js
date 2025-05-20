const API_KEY = '578a5673'; // Получите на omdbapi.com
const BASE_URL = `http://www.omdbapi.com/?apikey=${API_KEY}`;

export const fetchMovies = async (search, type = '') => {
  const response = await fetch(`${BASE_URL}&s=${search}&type=${type}`);
  return await response.json();
};