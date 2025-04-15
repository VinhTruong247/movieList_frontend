import axios from 'axios';

const API_URL = 'https://65f43205f54db27bc020c3ff.mockapi.io/api/v1/movieList';

export const fetchMovies = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

export const fetchMovieById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie with id ${id}:`, error);
    throw error;
  }
};

export const createMovie = async (movieData) => {
  try {
    const response = await axios.post(API_URL, movieData);
    return response.data;
  } catch (error) {
    console.error('Error creating movie:', error);
    throw error;
  }
};

export const updateMovie = async (id, movieData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, movieData);
    return response.data;
  } catch (error) {
    console.error('Error updating movie:', error);
    throw error;
  }
};