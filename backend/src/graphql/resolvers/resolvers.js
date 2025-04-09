import axios from 'axios';

const API_URL = 'https://65f43205f54db27bc020c3ff.mockapi.io/api/v1/movieList';

export const resolvers = {
  Query: {
    movies: async () => {
      try {
        const response = await axios.get(API_URL);
        return response.data;
      } catch (error) {
        console.error('Error fetching movies:', error);
        throw new Error('Failed to fetch movies');
      }
    },

    movie: async (_, { id }) => {
      try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching movie with id ${id}:`, error);
        throw new Error('Failed to fetch movie');
      }
    },

    moviesByGenre: async (_, { genre }) => {
      try {
        const response = await axios.get(API_URL);
        return response.data.filter(movie => 
          movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );
      } catch (error) {
        console.error('Error fetching movies by genre:', error);
        throw new Error('Failed to fetch movies by genre');
      }
    },

    searchMovies: async (_, { query }) => {
      try {
        const response = await axios.get(API_URL);
        const searchTerm = query.toLowerCase();
        return response.data.filter(movie => 
          movie.title.toLowerCase().includes(searchTerm) ||
          movie.description.toLowerCase().includes(searchTerm) ||
          movie.genre.some(g => g.toLowerCase().includes(searchTerm))
        );
      } catch (error) {
        console.error('Error searching movies:', error);
        throw new Error('Failed to search movies');
      }
    },

    topRatedMovies: async (_, { limit = 10 }) => {
      try {
        const response = await axios.get(API_URL);
        return response.data
          .sort((a, b) => b.imdb_rating - a.imdb_rating)
          .slice(0, limit);
      } catch (error) {
        console.error('Error fetching top rated movies:', error);
        throw new Error('Failed to fetch top rated movies');
      }
    },

    latestMovies: async (_, { limit = 10 }) => {
      try {
        const response = await axios.get(API_URL);
        return response.data
          .sort((a, b) => parseInt(b.year) - parseInt(a.year))
          .slice(0, limit);
      } catch (error) {
        console.error('Error fetching latest movies:', error);
        throw new Error('Failed to fetch latest movies');
      }
    }
  }
};