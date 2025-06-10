import { useState, useEffect } from "react";
import { Link } from "react-router";
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
  const [viewMode, setViewMode] = useState("grid");

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
      <div className="filter-section">
        <div className="filter-header">
          <div className="filter-title">
            <h2>Discover Movies & TV Shows</h2>
            <p>Find your next favorite entertainment</p>
          </div>
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <span className="icon">⊞</span>
              Grid
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <span className="icon">☰</span>
              List
            </button>
          </div>
        </div>

        <div className="filter-controls">
          <div className="section-wrapper">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search for movies and TV shows..."
                value={searchQuery}
                onChange={handleSearch}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="browse-section">
              <div className="browse-header">
                <h4>Find your Crew - Cast</h4>
              </div>
              <div className="browse-buttons">
                <Link to="/actors" className="browse-btn actors-btn">
                  <span className="icon">🎭</span>
                  <span className="text">Browse Actors</span>
                </Link>
                <Link to="/directors" className="browse-btn directors-btn">
                  <span className="icon">🎬</span>
                  <span className="text">Browse Directors</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="filter-tabs">
            <div className="tab-group">
              <span className="tab-label">Type:</span>
              <button
                className={`tab-btn ${activeMovieType === "all" ? "active" : ""}`}
                onClick={() => handleMovieTypeFilter("all")}
              >
                All
              </button>
              <button
                className={`tab-btn ${activeMovieType === "Movie" ? "active" : ""}`}
                onClick={() => handleMovieTypeFilter("Movie")}
              >
                Movies
              </button>
              <button
                className={`tab-btn ${activeMovieType === "TV Series" ? "active" : ""}`}
                onClick={() => handleMovieTypeFilter("TV Series")}
              >
                TV Shows
              </button>
            </div>

            <div className="tab-group">
              <span className="tab-label">Sort:</span>
              <button
                className={`tab-btn ${activeSortType === "all" ? "active" : ""}`}
                onClick={() => handleSortTypeFilter("all")}
              >
                Default
              </button>
              <button
                className={`tab-btn ${activeSortType === "top-rated" ? "active" : ""}`}
                onClick={() => handleSortTypeFilter("top-rated")}
              >
                Top Rated
              </button>
              <button
                className={`tab-btn ${activeSortType === "latest" ? "active" : ""}`}
                onClick={() => handleSortTypeFilter("latest")}
              >
                Latest
              </button>
            </div>
          </div>

          <div className="genre-filter">
            <GenreList
              selectedGenre={selectedGenre}
              onGenreSelect={handleGenreSelect}
              activeMovieType={activeMovieType}
              activeSortType={activeSortType}
              onMovieTypeChange={handleMovieTypeFilter}
              onSortTypeChange={handleSortTypeFilter}
            />
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="content-header">
          <div className="results-info">
            <h3>
              {selectedGenre !== "all" ||
              searchQuery ||
              activeMovieType !== "all"
                ? `Filtered Results (${filteredMovies.length})`
                : `All Movies & TV Shows (${filteredMovies.length})`}
            </h3>
            {(selectedGenre !== "all" ||
              searchQuery ||
              activeMovieType !== "all") && (
              <button className="clear-filters" onClick={resetFilters}>
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {filteredMovies.length > 0 ? (
          <div className={`movies-container ${viewMode}`}>
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} viewMode={viewMode} />
            ))}
          </div>
        ) : (
          <div className="no-movies-found">
            <div className="no-movies-icon">🎭</div>
            <h3>No movies found</h3>
            <p>
              We couldn't find any movies matching your criteria. Try adjusting
              your filters or search terms.
            </p>
            <button className="reset-filters-btn" onClick={resetFilters}>
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
