import { useState, useEffect } from "react";
import MovieCarousel from "./movieCarousel/MovieCarousel";
import MovieCard from "./movieCard/MovieCard";
import GenreList from "./movieGenreList/GenreList";
import Loader from "../../common/Loader";
import { useMovies } from "../../../hooks/useMovies";
import "./Home.scss";

const Home = () => {
  const { movies, loading, error } = useMovies();
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMovieType, setActiveMovieType] = useState("all");
  const [activeSortType, setActiveSortType] = useState("all");

  useEffect(() => {
    if (movies && movies.length > 0) {
      const sortedMovies = [...movies].sort((a, b) => {
        const idA = parseInt(a.id.replace(/-/g, ""), 16) || 0;
        const idB = parseInt(b.id.replace(/-/g, ""), 16) || 0;
        return idA - idB;
      });
      setFilteredMovies(sortedMovies);
    }
  }, [movies]);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    filterAndSortMovies(activeMovieType, activeSortType, genre);
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    filterAndSortMovies(activeMovieType, activeSortType, selectedGenre, query);
  };

  const handleMovieTypeFilter = (type) => {
    setActiveMovieType(type);
    filterAndSortMovies(type, activeSortType);
  };

  const handleSortTypeFilter = (sortType) => {
    setActiveSortType(sortType);
    filterAndSortMovies(activeMovieType, sortType);
  };

  const filterAndSortMovies = (
    movieType,
    sortType,
    genreOverride = null,
    searchOverride = null
  ) => {
    if (!movies || !movies.length) return;

    let filteredResults = [...movies];
    const genreToUse = genreOverride !== null ? genreOverride : selectedGenre;
    const searchToUse = searchOverride !== null ? searchOverride : searchQuery;

    if (searchToUse) {
      filteredResults = filteredResults.filter((movie) =>
        movie.title?.toLowerCase().includes(searchToUse.toLowerCase())
      );
    }

    if (genreToUse !== "all") {
      filteredResults = filteredResults.filter((movie) => {
        if (!movie.MovieGenres || !Array.isArray(movie.MovieGenres)) {
          return false;
        }

        return movie.MovieGenres.some(
          (genreItem) =>
            genreItem.Genres &&
            genreItem.Genres.name === genreToUse &&
            !genreItem.Genres.isDisabled
        );
      });
    }

    if (movieType === "Movie") {
      filteredResults = filteredResults.filter(
        (movie) => movie.type === "Movie"
      );
    } else if (movieType === "TV Series") {
      filteredResults = filteredResults.filter(
        (movie) => movie.type === "TV Series"
      );
    }

    if (sortType === "all") {
      filteredResults.sort((a, b) => {
        const idA = parseInt(a.id.replace(/-/g, ""), 16) || 0;
        const idB = parseInt(b.id.replace(/-/g, ""), 16) || 0;
        return idA - idB;
      });
    } else if (sortType === "top-rated") {
      filteredResults.sort(
        (a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0)
      );
    } else if (sortType === "latest") {
      filteredResults.sort((a, b) => (b.year || 0) - (a.year || 0));
    }

    setFilteredMovies(filteredResults);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedGenre("all");
    setActiveMovieType("all");
    setActiveSortType("all");

    if (movies && movies.length > 0) {
      const sortedMovies = [...movies].sort((a, b) => {
        const idA = parseInt(a.id.replace(/-/g, ""), 16) || 0;
        const idB = parseInt(b.id.replace(/-/g, ""), 16) || 0;
        return idA - idB;
      });
      setFilteredMovies(sortedMovies);
    }
  };

  if (loading) return <Loader />;
  if (error)
    return <div className="error-message">Error loading movies: {error}</div>;

  return (
    <div className="home-container">
      <MovieCarousel movies={movies} />

      <div className="content-wrapper">
        <aside className="sidebar">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <GenreList
            selectedGenre={selectedGenre}
            onGenreSelect={handleGenreSelect}
            activeMovieType={activeMovieType}
            activeSortType={activeSortType}
            onMovieTypeChange={handleMovieTypeFilter}
            onSortTypeChange={handleSortTypeFilter}
          />
        </aside>

        <div className="main-content">
          {filteredMovies.length > 0 ? (
            <div className="movies-grid">
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="no-movies-found">
              <h3>No movies found</h3>
              <p>Try adjusting your search criteria or filters</p>
              <button className="reset-filters-btn" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
