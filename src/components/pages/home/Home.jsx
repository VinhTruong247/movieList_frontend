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
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMovieType, setActiveMovieType] = useState("all");
  const [activeSortType, setActiveSortType] = useState("all");

  useEffect(() => {
    let tempMovies = [...movies];

    if (searchQuery) {
      tempMovies = tempMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== "all") {
      tempMovies = tempMovies.filter((movie) =>
        movie.genre.includes(selectedGenre)
      );
    }

    tempMovies.sort((a, b) => Number(a.id) - Number(b.id));
    setFilteredMovies(tempMovies);
  }, [selectedGenre, movies, searchQuery]);

  const handleGenreSelect = (genre) => {
    setSelectedGenre(genre);
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);

    let sortedMovies = [...movies];

    if (searchQuery) {
      sortedMovies = sortedMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== "all") {
      sortedMovies = sortedMovies.filter((movie) =>
        movie.genre.includes(selectedGenre)
      );
    }

    if (filter === "Movie") {
      sortedMovies = sortedMovies.filter((movie) => movie.type === "Movie");
    } else if (filter === "TV Series") {
      sortedMovies = sortedMovies.filter((movie) => movie.type === "TV Series");
    }
    if (filter === "all") {
      sortedMovies.sort((a, b) => a.id - b.id);
    } else if (filter === "top-rated") {
      sortedMovies.sort((a, b) => b.imdb_rating - a.imdb_rating);
    } else if (filter === "latest") {
      sortedMovies.sort((a, b) => b.year - a.year);
    } else {
      sortedMovies.sort((a, b) => a.id - b.id);
    }
    setFilteredMovies(sortedMovies);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleMovieTypeFilter = (type) => {
    setActiveMovieType(type);
    filterAndSortMovies(type, activeSortType);
  };

  const handleSortTypeFilter = (sortType) => {
    setActiveSortType(sortType);
    filterAndSortMovies(activeMovieType, sortType);
  };

  const filterAndSortMovies = (movieType, sortType) => {
    let filteredResults = [...movies];

    if (searchQuery) {
      filteredResults = filteredResults.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedGenre !== "all") {
      filteredResults = filteredResults.filter((movie) =>
        movie.genre.includes(selectedGenre)
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
          <div className="movies-grid">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
