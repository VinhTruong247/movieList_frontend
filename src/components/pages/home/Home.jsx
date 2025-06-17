import { Link } from "react-router";
import { useMovies } from "../../../hooks/useMovies";
import MovieCarousel from "./movieCarousel/MovieCarousel";
import MovieCard from "./movieCard/MovieCard";
import GenreList from "./movieGenreList/GenreList";
import Loader from "../../common/Loader";
import "./Home.scss";

const Home = () => {
  const {
    allMovies,
    movies: filteredMovies,
    loading,
    error,
    filters,
    viewMode,
    setSearchQuery,
    selectGenre,
    selectMovieType,
    selectSortType,
    changeViewMode,
    clearFilters,
  } = useMovies();

  const {
    search: searchQuery,
    genre: selectedGenre,
    movieType: activeMovieType,
    sortType: activeSortType,
  } = filters;

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  if (loading) return <Loader />;
  if (error)
    return <div className="error-message">Error loading movies: {error}</div>;

  return (
    <div className="home-container">
      <MovieCarousel movies={allMovies} />
      <div className="filter-section">
        <div className="filter-header">
          <div className="filter-title">
            <h2>Discover Movies & TV Shows</h2>
            <p>Find your next favorite entertainment</p>
          </div>
          <div className="view-controls">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => changeViewMode("grid")}
            >
              <span className="icon">⊞</span>
              Grid
            </button>
            <button
              className={`view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => changeViewMode("list")}
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
          </div>

          <div className="filter-tabs">
            <div className="tab-group">
              <span className="tab-label">Type:</span>
              <button
                className={`tab-btn ${
                  activeMovieType === "all" ? "active" : ""
                }`}
                onClick={() => selectMovieType("all")}
              >
                All
              </button>
              <button
                className={`tab-btn ${
                  activeMovieType === "Movie" ? "active" : ""
                }`}
                onClick={() => selectMovieType("Movie")}
              >
                Movies
              </button>
              <button
                className={`tab-btn ${
                  activeMovieType === "TV Series" ? "active" : ""
                }`}
                onClick={() => selectMovieType("TV Series")}
              >
                TV Shows
              </button>
            </div>

            <div className="tab-group">
              <span className="tab-label">Sort:</span>
              <button
                className={`tab-btn ${
                  activeSortType === "all" ? "active" : ""
                }`}
                onClick={() => selectSortType("all")}
              >
                Default
              </button>
              <button
                className={`tab-btn ${
                  activeSortType === "top-rated" ? "active" : ""
                }`}
                onClick={() => selectSortType("top-rated")}
              >
                Top Rated
              </button>
              <button
                className={`tab-btn ${
                  activeSortType === "latest" ? "active" : ""
                }`}
                onClick={() => selectSortType("latest")}
              >
                Latest
              </button>
            </div>
          </div>

          <div className="genre-filter">
            <GenreList
              selectedGenre={selectedGenre}
              onGenreSelect={selectGenre}
              activeMovieType={activeMovieType}
              activeSortType={activeSortType}
              onMovieTypeChange={selectMovieType}
              onSortTypeChange={selectSortType}
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
              <button className="clear-filters" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}

            <div className="browse-section">
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
            <button className="reset-filters-btn" onClick={clearFilters}>
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
