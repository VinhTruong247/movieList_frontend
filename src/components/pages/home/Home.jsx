import React, { useState, useEffect } from "react";
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
      setFilteredMovies([...movies]);
    }
  }, [movies]);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
    filterAndSortMovies(activeMovieType, activeSortType, genre);
  };

  const handleSearch = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    let filteredResults = [...movies];

    if (query) {
      filteredResults = filteredResults.filter((movie) =>
        movie.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedGenre !== "all") {
      filteredResults = filteredResults.filter((movie) =>
        movie.genre.includes(selectedGenre)
      );
    }

    if (activeMovieType === "Movie") {
      filteredResults = filteredResults.filter(
        (movie) => movie.type === "Movie"
      );
    } else if (activeMovieType === "TV Series") {
      filteredResults = filteredResults.filter(
        (movie) => movie.type === "TV Series"
      );
    }

    if (activeSortType === "top-rated") {
      filteredResults.sort((a, b) => b.imdb_rating - a.imdb_rating);
    } else if (activeSortType === "latest") {
      filteredResults.sort((a, b) => b.year - a.year);
    } else {
      filteredResults.sort((a, b) => a.id - b.id);
    }

    setFilteredMovies(filteredResults);
  };

  const handleMovieTypeFilter = (type) => {
    setActiveMovieType(type);
    filterAndSortMovies(type, activeSortType);
  };

  const handleSortTypeFilter = (sortType) => {
    setActiveSortType(sortType);
    filterAndSortMovies(activeMovieType, sortType);
  };

  const filterAndSortMovies = (movieType, sortType, genreOverride = null) => {
    let filteredResults = [...movies];
    const genreToUse = genreOverride !== null ? genreOverride : selectedGenre;

    if (searchQuery) {
      filteredResults = filteredResults.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (genreToUse !== "all") {
      filteredResults = filteredResults.filter((movie) =>
        movie.genre.includes(genreToUse)
      );
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
      filteredResults.sort((a, b) => a.id - b.id);
    } else if (sortType === "top-rated") {
      filteredResults.sort((a, b) => b.imdb_rating - a.imdb_rating);
    } else if (sortType === "latest") {
      filteredResults.sort((a, b) => b.year - a.year);
    }

    console.log(sortType);

    setFilteredMovies(filteredResults);
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
              <button
                className="reset-filters-btn"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre("all");
                  setActiveMovieType("all");
                  setActiveSortType("all");
                  setFilteredMovies([...movies]);
                }}
              >
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
