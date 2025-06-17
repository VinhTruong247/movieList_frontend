import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { useSelector } from "react-redux";
import { getActorById } from "../../../../services/ActorsAPI";
import { getMovies } from "../../../../services/MovieListAPI";
import MovieCard from "../../home/movieCard/MovieCard";
import Loader from "../../../common/Loader";
import "./ActorDetail.scss";

const ActorDetail = () => {
  const { id } = useParams();
  const [actor, setActor] = useState(null);
  const [actorMovies, setActorMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isAdmin = currentUser?.role === "admin";

  useEffect(() => {
    const fetchActorData = async () => {
      try {
        setLoading(true);
        const actorData = await getActorById(id);
        if (actorData.isDisabled && !isAdmin) {
          setError("Actor not found or is currently unavailable.");
          return;
        }

        setActor(actorData);
        const allMovies = await getMovies();
        const filteredMovies = allMovies.filter((movie) => {
          if (!movie.MovieActors || !Array.isArray(movie.MovieActors)) {
            return false;
          }

          return movie.MovieActors.some(
            (ma) =>
              ma.Actors &&
              ma.Actors.id === id &&
              (isAdmin || !ma.Actors.isDisabled)
          );
        });

        const sortedMovies = filteredMovies.sort((a, b) => {
          if (b.year !== a.year) {
            return (b.year || 0) - (a.year || 0);
          }
          return (b.imdb_rating || 0) - (a.imdb_rating || 0);
        });

        setActorMovies(sortedMovies);
      } catch (err) {
        console.error("Error fetching actor data:", err);
        setError(err.message || "Failed to load actor information");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchActorData();
    }
  }, [id, isAdmin]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="actor-detail-error">
        <div className="error-content">
          <div className="error-icon">🎭</div>
          <h2>Actor Not Found</h2>
          <p>{error}</p>
          <Link to="/" className="back-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="actor-detail-error">
        <div className="error-content">
          <div className="error-icon">🎭</div>
          <h2>Actor Not Found</h2>
          <p>The actor you're looking for doesn't exist.</p>
          <Link to="/" className="back-home-btn">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="actor-detail-container">
      <div className="actor-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>

        <div className="hero-content">
          <div className="actor-profile">
            <div className="actor-image">
              <img
                src={
                  actor.image_url ||
                  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019"
                }
                alt={actor.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/330px-No-Image-Placeholder.svg.png?20200912122019";
                }}
              />
              {isAdmin && actor.isDisabled && (
                <div className="disabled-badge">
                  <span>Disabled</span>
                </div>
              )}
            </div>

            <div className="actor-info">
              <h1 className="actor-name">
                {actor.name}
                {isAdmin && actor.isDisabled && (
                  <span className="disabled-indicator"> (Disabled)</span>
                )}
              </h1>

              {actor.nationality && (
                <div className="actor-nationality">
                  <span className="label">Nationality:</span>
                  <span className="value">{actor.nationality}</span>
                </div>
              )}

              <div className="actor-stats">
                <div className="stat-item">
                  <span className="stat-number">{actorMovies.length}</span>
                  <span className="stat-label">
                    {actorMovies.length === 1 ? "Movie" : "Movies"}
                  </span>
                </div>

                {actorMovies.length > 0 && (
                  <>
                    <div className="stat-item">
                      <span className="stat-number">
                        {Math.max(...actorMovies.map((m) => m.year || 0))}
                      </span>
                      <span className="stat-label">Latest Year</span>
                    </div>

                    <div className="stat-item">
                      <span className="stat-number">
                        {(
                          actorMovies.reduce(
                            (sum, m) => sum + (m.imdb_rating || 0),
                            0
                          ) / actorMovies.length
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

      {actor.biography && (
        <div className="actor-biography">
          <div className="container">
            <h2>Biography</h2>
            <div className="biography-content">
              <p>{actor.biography}</p>
            </div>
          </div>
        </div>
      )}

      <div className="actor-filmography">
        <div className="container">
          <div className="section-header">
            <h2>Filmography</h2>
            <p>
              {actorMovies.length === 0
                ? "No movies found for this actor"
                : `${actorMovies.length} ${actorMovies.length === 1 ? "movie" : "movies"} starring ${actor.name}`}
            </p>
          </div>

          {actorMovies.length > 0 ? (
            <div className="movies-grid">
              {actorMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="no-movies">
              <div className="no-movies-icon">🎭</div>
              <h3>No Movies Found</h3>
              <p>
                This actor hasn't been associated with any movies in our
                database yet.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="actor-navigation">
        <div className="container">
          <Link to="/" className="back-btn">
            ← Back to Movies
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActorDetail;