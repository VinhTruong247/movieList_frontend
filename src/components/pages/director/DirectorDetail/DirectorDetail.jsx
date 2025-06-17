import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useSelector } from "react-redux";
import { getDirectorById } from "../../../../services/DirectorsAPI";
import { getMovies } from "../../../../services/MovieListAPI";
import MovieCard from "../../home/movieCard/MovieCard";
import Loader from "../../../common/Loader";
import "./DirectorDetail.scss";

const DirectorDetail = () => {
  const { id } = useParams();
  const [director, setDirector] = useState(null);
  const [directorMovies, setDirectorMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchDirectorData = async () => {
      try {
        setLoading(true);
        const directorData = await getDirectorById(id);
        if (directorData.isDisabled && !isAdmin) {
          setError("Director not found or is currently unavailable.");
          return;
        }

        setDirector(directorData);
        const allMovies = await getMovies();
        const filteredMovies = allMovies.filter((movie) => {
          if (!movie.MovieDirectors || !Array.isArray(movie.MovieDirectors)) {
            return false;
          }

          return movie.MovieDirectors.some(
            (md) =>
              md.Directors &&
              md.Directors.id === id &&
              (isAdmin || !md.Directors.isDisabled)
          );
        });

        const sortedMovies = filteredMovies.sort((a, b) => {
          if (b.year !== a.year) {
            return (b.year || 0) - (a.year || 0);
          }
          return (b.imdb_rating || 0) - (a.imdb_rating || 0);
        });

        setDirectorMovies(sortedMovies);
      } catch (err) {
        console.error("Error fetching director data:", err);
        setError(err.message || "Failed to load director information");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDirectorData();
    }
  }, [id, isAdmin]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="director-detail-error">
        <div className="error-content">
          <div className="error-icon">🎬</div>
          <h2>Director Not Found</h2>
          <p>{error}</p>
          <Link to="/" className="back-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!director) {
    return (
      <div className="director-detail-error">
        <div className="error-content">
          <div className="error-icon">🎬</div>
          <h2>Director Not Found</h2>
          <p>The director you're looking for doesn't exist.</p>
          <Link to="/" className="back-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="director-detail-container">
      <div className="director-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="director-profile">
            <div className="director-image">
              <img
                src={
                  director.image_url ||
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019"
                }
                alt={director.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019";
                }}
              />
              {isAdmin && director.isDisabled && (
                <div className="disabled-badge">
                  <span>Disabled</span>
                </div>
              )}
            </div>

            <div className="director-info">
              <h1 className="director-name">
                {director.name}
                {isAdmin && director.isDisabled && (
                  <span className="disabled-indicator"> (Disabled)</span>
                )}
              </h1>

              {director.nationality && (
                <div className="director-nationality">
                  <span className="label">Nationality:</span>
                  <span className="value">{director.nationality}</span>
                </div>
              )}

              <div className="director-stats">
                <div className="stat-item">
                  <span className="stat-number">{directorMovies.length}</span>
                  <span className="stat-label">
                    {directorMovies.length === 1 ? "Movie" : "Movies"}
                  </span>
                </div>

                {directorMovies.length > 0 && (
                  <>
                    <div className="stat-item">
                      <span className="stat-number">
                        {Math.max(...directorMovies.map((m) => m.year || 0))}
                      </span>
                      <span className="stat-label">Latest Year</span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-number">
                        {(
                          directorMovies.reduce(
                            (sum, m) => sum + (m.imdb_rating || 0),
                            0
                          ) / directorMovies.length
                        ).toFixed(1)}
                      </span>
                      <span className="stat-label">Avg Rating</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {director.biography && (
        <div className="director-biography">
          <div className="container">
            <h2>Biography</h2>
            <div className="biography-content">
              <p>{director.biography}</p>
            </div>
          </div>
        </div>
      )}

      <div className="director-filmography">
        <div className="container">
          <div className="section-header">
            <h2>Filmography</h2>
            <p>
              {directorMovies.length === 0
                ? "No movies found for this director"
                : `${directorMovies.length} ${directorMovies.length === 1 ? "movie" : "movies"} directed`}
            </p>
          </div>

          {directorMovies.length > 0 ? (
            <div className="movies-grid">
              {directorMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="no-movies">
              <div className="no-movies-icon">🎬</div>
              <h3>No Movies Found</h3>
              <p>
                This director hasn't been associated with any movies in our
                database yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="director-navigation">
        <div className="container">
          <Link to="/" className="back-btn">
            ← Back to Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DirectorDetail;
