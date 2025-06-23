import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router";
import MovieCarousel from "./movieCarousel/MovieCarousel";
import MovieCard from "../movie/movieCard/MovieCard";
import { useMovies } from "../../../hooks/useMovies";
import { useSocial } from "../../../hooks/useSocial";
import Loader from "../../common/Loader";
import "./Home.scss";

const Home = () => {
  const navigate = useNavigate();
  const { allMovies, loading, error } = useMovies();
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [recentMovies, setRecentMovies] = useState([]);
  const currentUser = useSelector((state) => state.auth.currentUser);

  const {
    publicLists,
    followersLoading,
    followingLoading,
    listsLoading,
    loadPublicLists,
  } = useSocial();

  useEffect(() => {
    loadPublicLists(4);
    if (allMovies?.length) {
      const trending = [...allMovies]
        .filter((m) => !m.isDisabled && m.imdb_rating)
        .sort((a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0))
        .slice(0, 8);
      setTrendingMovies(trending);
      const recent = [...allMovies]
        .filter((m) => !m.isDisabled)
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.id - a.id;
        })
        .slice(0, 8);
      setRecentMovies(recent);
    }
  }, [allMovies, loadPublicLists]);

  if (loading) return <Loader />;
  if (error)
    return <div className="error-message">Error loading movies: {error}</div>;

  const isLoading =
    followersLoading || followingLoading || listsLoading || loading;

  return (
    <div className="home-container">
      <MovieCarousel movies={allMovies} />
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Your Ultimate Movie Experience</h1>
          <p className="hero-subtitle">
            Discover, track and share your favorite movies and TV shows
          </p>
          <div className="hero-actions">
            <button className="primary-btn" onClick={() => navigate("/movies")}>
              Browse All Movies
            </button>
            {!currentUser && (
              <button
                className="secondary-btn"
                onClick={() => navigate("/register")}
              >
                Join Now
              </button>
            )}
          </div>
        </div>
      </div>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🎬</div>
          <h3>Extensive Collection</h3>
          <p>
            Explore our vast library of movies and TV shows with new titles
            added regularly
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">❤️</div>
          <h3>Track Favorites</h3>
          <p>Keep track of what you love and build your personal collection</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🌟</div>
          <h3>Custom Lists</h3>
          <p>
            Create and share custom movie lists with friends and the community
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">👥</div>
          <h3>Social Community</h3>
          <p>
            Connect with fellow movie enthusiasts and discover new
            recommendations
          </p>
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Trending Now</h2>
          <Link to="/movies" className="see-all-link">
            See All <span className="arrow-icon">→</span>
          </Link>
        </div>
        <div className="movies-row">
          {trendingMovies.map((movie) => (
            <div key={movie.id} className="movie-card-wrapper">
              <MovieCard movie={movie} viewMode="compact" />
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Recently Added</h2>
          <Link to="/movies" className="see-all-link">
            See All <span className="arrow-icon">→</span>
          </Link>
        </div>
        <div className="movies-row">
          {recentMovies.map((movie) => (
            <div key={movie.id} className="movie-card-wrapper">
              <MovieCard movie={movie} viewMode="compact" />
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-header">
          <h2>Featured Lists</h2>
          {currentUser ? (
            <Link to="/shared-lists" className="see-all-link">
              Create your list <span className="arrow-icon">→</span>
            </Link>
          ) : (
            <button
              className="see-all-link"
              onClick={() => navigate("/not-login")}
            >
              Create your list <span className="arrow-icon">→</span>
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading featured lists...</p>
          </div>
        ) : publicLists.length > 0 ? (
          <div className="lists-showcase">
            {publicLists.slice(0, 4).map((list) => (
              <div key={list.id} className="featured-list-card">
                <div className="list-header">
                  <h3>{list.title}</h3>
                  <span className="movie-count">
                    {list.SharedListMovies?.length || 0} movies
                  </span>
                </div>
                <div className="list-movies-preview">
                  {list.SharedListMovies?.slice(0, 3).map((item) => (
                    <div key={item.movie_id} className="movie-poster-thumbnail">
                      <img
                        src={item.Movies?.poster_url || "/placeholder.jpg"}
                        alt={item.Movies?.title}
                        onClick={() => navigate(`/movies/${item.movie_id}`)}
                      />
                    </div>
                  ))}
                  {list.SharedListMovies?.length > 3 && (
                    <div className="more-movies">
                      +{list.SharedListMovies.length - 3}
                    </div>
                  )}
                </div>
                <div className="list-footer">
                  <div className="list-creator">
                    <div className="creator-avatar">
                      {list.user_public_profiles?.avatar_url ? (
                        <img
                          src={list.user_public_profiles.avatar_url}
                          alt={list.user_public_profiles.name}
                        />
                      ) : (
                        <span>
                          {(list.user_public_profiles?.name ||
                            list.user_public_profiles?.username ||
                            "?")[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span
                      className="creator-name"
                      onClick={() => navigate(`/profile/${list.user_id}`)}
                    >
                      {list.user_public_profiles?.name ||
                        list.user_public_profiles?.username}
                    </span>
                  </div>
                  <button
                    className="view-list-btn"
                    onClick={() => navigate(`/shared-lists/${list.id}`)}
                  >
                    View List
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-lists">
            <p>No public lists available yet. Be the first to create one!</p>
            {currentUser && (
              <button
                className="create-list-btn"
                onClick={() => navigate("/shared-lists")}
              >
                Create a List
              </button>
            )}
          </div>
        )}
      </section>

      <section className="explore-section">
        <div className="section-header centered">
          <h2>Explore More</h2>
          <p>Discover more about the people behind your favorite films</p>
        </div>
        <div className="explore-cards">
          <Link to="/movies" className="explore-card">
            <div className="explore-icon">🎬</div>
            <div className="explore-content">
              <h3>Movies & TV</h3>
              <p>Browse our complete collection</p>
            </div>
            <div className="explore-arrow">→</div>
          </Link>
          <Link to="/actors" className="explore-card">
            <div className="explore-icon">🎭</div>
            <div className="explore-content">
              <h3>Actors</h3>
              <p>Discover talented performers</p>
            </div>
            <div className="explore-arrow">→</div>
          </Link>
          <Link to="/directors" className="explore-card">
            <div className="explore-icon">📽️</div>
            <div className="explore-content">
              <h3>Directors</h3>
              <p>Explore visionary filmmakers</p>
            </div>
            <div className="explore-arrow">→</div>
          </Link>
          <Link to="/social" className="explore-card">
            <div className="explore-icon">👥</div>
            <div className="explore-content">
              <h3>Social</h3>
              <p>Connect with movie enthusiasts</p>
            </div>
            <div className="explore-arrow">→</div>
          </Link>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to start your movie journey?</h2>
          <p>
            Join our community today and start tracking your favorite movies and
            TV shows.
          </p>
          <div className="cta-buttons">
            {currentUser ? (
              <button
                className="primary-btn"
                onClick={() => navigate("/movies")}
              >
                Browse Movies
              </button>
            ) : (
              <>
                <button
                  className="primary-btn"
                  onClick={() => navigate("/register")}
                >
                  Sign Up Now
                </button>
                <button
                  className="secondary-btn"
                  onClick={() => navigate("/login")}
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
