import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { fetchMovies } from "../../../redux/slices/moviesSlice";
import { useSocial } from "../../../hooks/useSocial";
import MovieCard from "../movie/movieCard/MovieCard";
import "./SocialPage.scss";

const SocialPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const { items: movies, loading: moviesLoading } = useSelector(
    (state) => state.movies
  );
  const isAdmin = currentUser?.role === "admin";

  const {
    followers,
    following,
    publicLists,
    followersLoading,
    followingLoading,
    listsLoading,
    handleFollowUser,
    handleUnfollowUser,
    isFollowing,
    loadPublicLists,
    loadUserSocialData,
  } = useSocial();

  useEffect(() => {
    dispatch(fetchMovies(isAdmin));
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (currentUser) {
      loadUserSocialData(currentUser.id);
    }
    loadPublicLists(10);
  }, [currentUser, loadUserSocialData, loadPublicLists]);

  const getTrendingMovies = () => {
    if (!movies || movies.length === 0) return [];

    return [...movies]
      .filter((movie) => !movie.isDisabled && movie.imdb_rating)
      .sort((a, b) => (b.imdb_rating || 0) - (a.imdb_rating || 0))
      .slice(0, 8);
  };

  const handleFollowToggle = async (userId, userData) => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      if (isFollowing(userId)) {
        await handleUnfollowUser(userId);
      } else {
        await handleFollowUser(userId, userData);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  const filteredLists = searchQuery
    ? publicLists.filter(
        (list) =>
          list.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (list.description &&
            list.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (list.user_public_profiles?.username &&
            list.user_public_profiles.username
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (list.user_public_profiles?.name &&
            list.user_public_profiles.name
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      )
    : publicLists;

  const isLoading =
    followersLoading || followingLoading || listsLoading || moviesLoading;
  const trendingMovies = getTrendingMovies();

  return (
    <div className="social-page-container">
      <div className="social-header">
        <h1 className="page-title">Movie Social Hub</h1>
        <p className="page-subtitle">
          Discover new movies, follow other movie enthusiasts, and share your
          collections
        </p>
      </div>

      {!currentUser && (
        <div className="guest-banner">
          <div className="banner-content">
            <h2>Join Our Movie Community</h2>
            <p>
              Create an account to follow other movie enthusiasts, share your
              collections, and discover personalized recommendations.
            </p>
            <div className="banner-actions">
              <button
                className="signup-btn"
                onClick={() => navigate("/register")}
              >
                Sign Up
              </button>
              <button className="login-btn" onClick={() => navigate("/login")}>
                Log In
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="social-nav-tabs">
        <button
          className={`nav-tab ${activeTab === "discover" ? "active" : ""}`}
          onClick={() => setActiveTab("discover")}
        >
          <span className="tab-icon">🔍</span>
          Discover
        </button>
        <button
          className={`nav-tab ${activeTab === "trending" ? "active" : ""}`}
          onClick={() => setActiveTab("trending")}
        >
          <span className="tab-icon">🔥</span>
          Trending
        </button>

        <button
          className={`nav-tab ${activeTab === "network" ? "active" : ""}`}
          onClick={() => setActiveTab("network")}
        >
          <span className="tab-icon">👥</span>
          {currentUser ? "My Network" : "Our Community"}
          {currentUser && (
            <span className="count-badge">
              {following.length + followers.length}
            </span>
          )}
        </button>
        <button
          className={`nav-tab ${activeTab === "lists" ? "active" : ""}`}
          onClick={() => setActiveTab("lists")}
        >
          <span className="tab-icon">📋</span>
          Public Lists
          <span className="count-badge">{publicLists.length}</span>
        </button>
      </div>

      <div className="social-content">
        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading social content...</p>
          </div>
        ) : (
          <>
            {activeTab === "discover" && (
              <div className="discover-section">
                <div className="section-header">
                  <h2>Discover Movies and People</h2>
                  <p>Find new connections and expand your movie knowledge</p>
                </div>

                <div className="featured-content">
                  <div className="trending-preview">
                    <div className="preview-header">
                      <h3>Trending Movies</h3>
                      <button
                        className="see-all-btn"
                        onClick={() => setActiveTab("trending")}
                      >
                        See All
                      </button>
                    </div>

                    {trendingMovies.length > 0 ? (
                      <div className="trending-movies-grid">
                        {trendingMovies.slice(0, 4).map((movie) => (
                          <div key={movie.id} className="trending-movie-item">
                            <MovieCard movie={movie} viewMode="compact" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-trending-preview">
                        <div className="empty-icon">🎬</div>
                        <p>No trending movies available</p>
                        <button
                          className="browse-movies-btn"
                          onClick={() => navigate("/movies")}
                        >
                          Browse All Movies
                        </button>
                      </div>
                    )}
                  </div>

                  {currentUser && following.length > 0 && (
                    <div className="network-preview">
                      <div className="preview-header">
                        <h3>People You Follow</h3>
                        <button
                          className="see-all-btn"
                          onClick={() => setActiveTab("network")}
                        >
                          See All
                        </button>
                      </div>
                      <div className="following-preview-grid">
                        {following.slice(0, 5).map((follow) => (
                          <div
                            key={follow.followee_id}
                            className="user-card-small"
                          >
                            <div
                              className="user-avatar"
                              onClick={() =>
                                navigate(`/profile/${follow.followee_id}`)
                              }
                            >
                              {follow.user_public_profiles?.avatar_url ? (
                                <img
                                  src={follow.user_public_profiles.avatar_url}
                                  alt={`${follow.user_public_profiles.name || follow.user_public_profiles.username}'s avatar`}
                                />
                              ) : (
                                <div className="avatar-placeholder">
                                  {follow.user_public_profiles?.name
                                    ?.charAt(0)
                                    ?.toUpperCase() ||
                                    follow.user_public_profiles?.username
                                      ?.charAt(0)
                                      ?.toUpperCase() ||
                                    "U"}
                                </div>
                              )}
                            </div>
                            <div className="user-info">
                              <h4>
                                {follow.user_public_profiles?.name ||
                                  follow.user_public_profiles?.username}
                              </h4>
                              <button
                                className="unfollow-btn"
                                onClick={() =>
                                  handleFollowToggle(follow.followee_id)
                                }
                              >
                                Unfollow
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="public-lists-preview">
                    <div className="preview-header">
                      <h3>Featured Lists</h3>
                      <button
                        className="see-all-btn"
                        onClick={() => setActiveTab("lists")}
                      >
                        See All
                      </button>
                    </div>

                    {publicLists.length > 0 ? (
                      <div className="lists-preview-grid">
                        {publicLists.slice(0, 2).map((list) => (
                          <div key={list.id} className="list-card">
                            <div className="list-header">
                              <h4>{list.title}</h4>
                              <span className="movie-count">
                                {list.SharedListMovies?.length || 0} movies
                              </span>
                            </div>

                            <p className="list-description">
                              {list.description || "No description provided"}
                            </p>

                            <div className="list-movies-preview">
                              {list.SharedListMovies?.slice(0, 3).map(
                                (item) => (
                                  <div
                                    key={`${list.id}-${item.movie_id}`}
                                    className="movie-poster"
                                  >
                                    <img
                                      src={
                                        item.Movies?.poster_url ||
                                        "/placeholder.jpg"
                                      }
                                      alt={item.Movies?.title}
                                      onClick={() =>
                                        navigate(`/movies/${item.movie_id}`)
                                      }
                                    />
                                  </div>
                                )
                              )}
                              {list.SharedListMovies?.length > 3 && (
                                <div className="more-count">
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
                                      alt={`${list.user_public_profiles.name || list.user_public_profiles.username}'s avatar`}
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
                                  onClick={() =>
                                    navigate(`/profile/${list.user_id}`)
                                  }
                                >
                                  {list.user_public_profiles?.name ||
                                    list.user_public_profiles?.username}
                                </span>
                              </div>
                              <button
                                className="view-list-btn"
                                onClick={() =>
                                  navigate(`/shared-lists/${list.id}`)
                                }
                              >
                                View List
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-preview-state">
                        <div className="empty-icon">📋</div>
                        <p>No public lists available yet</p>
                        {currentUser && (
                          <button
                            className="create-list-btn"
                            onClick={() => navigate("/shared-lists")}
                          >
                            Create First List
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "trending" && (
              <div className="trending-section">
                <div className="section-header">
                  <h2>Trending Movies</h2>
                  <p>Popular films among our community</p>
                </div>

                {trendingMovies.length > 0 ? (
                  <div className="trending-movies-grid full-grid">
                    {trendingMovies.map((movie) => (
                      <div key={movie.id} className="trending-movie-item">
                        <MovieCard movie={movie} viewMode="grid" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-trending-state">
                    <div className="empty-icon">🔥</div>
                    <h3>No Trending Movies</h3>
                    <p>
                      We're still gathering data on popular movies. Check back
                      soon!
                    </p>
                    <div className="empty-actions">
                      <button
                        className="browse-movies-btn"
                        onClick={() => navigate("/movies")}
                      >
                        Browse All Movies
                      </button>
                      {currentUser && (
                        <button
                          className="create-list-btn secondary"
                          onClick={() => navigate("/shared-lists")}
                        >
                          Create Your List
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "network" && (
              <div className="network-section">
                {currentUser ? (
                  isAdmin ? (
                    // Admin view - show just a header and button to view all users
                    <div className="admin-network-view">
                      <div className="section-header">
                        <h2>User Management</h2>
                        <p>As an admin, you can view all application users</p>
                      </div>

                      <div className="admin-actions">
                        <button
                          className="discover-people-btn admin-btn"
                          onClick={() => navigate("/social/discover")}
                        >
                          <span className="btn-icon">👥</span>
                          View App Users
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="network-grid">
                        <div className="network-column">
                          <div className="network-card">
                            <h3>People I Follow ({following.length})</h3>
                            {following.length > 0 ? (
                              <div className="user-list">
                                {following.map((follow) => (
                                  <div
                                    key={follow.followee_id}
                                    className="user-item"
                                  >
                                    <div
                                      className="user-avatar"
                                      onClick={() =>
                                        navigate(
                                          `/profile/${follow.followee_id}`
                                        )
                                      }
                                    >
                                      {follow.user_public_profiles
                                        ?.avatar_url ? (
                                        <img
                                          src={
                                            follow.user_public_profiles
                                              .avatar_url
                                          }
                                          alt={follow.user_public_profiles.name}
                                        />
                                      ) : (
                                        <div className="avatar-placeholder">
                                          {follow.user_public_profiles?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            follow.user_public_profiles?.username
                                              ?.charAt(0)
                                              ?.toUpperCase() ||
                                            "U"}
                                        </div>
                                      )}
                                    </div>
                                    <div className="user-info">
                                      <h4>
                                        {follow.user_public_profiles?.name}
                                      </h4>
                                      <p>
                                        @{follow.user_public_profiles?.username}
                                      </p>
                                    </div>
                                    <div className="user-actions">
                                      <button
                                        className="profile-btn"
                                        onClick={() =>
                                          navigate(
                                            `/profile/${follow.followee_id}`
                                          )
                                        }
                                      >
                                        Profile
                                      </button>
                                      <button
                                        className="unfollow-btn"
                                        onClick={() =>
                                          handleFollowToggle(follow.followee_id)
                                        }
                                      >
                                        Unfollow
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="empty-state">
                                <div className="empty-icon">👥</div>
                                <p>You aren't following anyone yet</p>
                                <button
                                  className="explore-btn"
                                  onClick={() => navigate(`/social/discover`)}
                                >
                                  Discover People
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="network-column">
                          <div className="network-card">
                            <h3>My Followers ({followers.length})</h3>
                            {followers.length > 0 ? (
                              <div className="user-list">
                                {followers.map((follower) => (
                                  <div
                                    key={follower.follower_id}
                                    className="user-item"
                                  >
                                    <div
                                      className="user-avatar"
                                      onClick={() =>
                                        navigate(
                                          `/profile/${follower.follower_id}`
                                        )
                                      }
                                    >
                                      {follower.user_public_profiles
                                        ?.avatar_url ? (
                                        <img
                                          src={
                                            follower.user_public_profiles
                                              .avatar_url
                                          }
                                          alt={
                                            follower.user_public_profiles.name
                                          }
                                        />
                                      ) : (
                                        <div className="avatar-placeholder">
                                          {follower.user_public_profiles?.name
                                            ?.charAt(0)
                                            ?.toUpperCase() ||
                                            follower.user_public_profiles?.username
                                              ?.charAt(0)
                                              ?.toUpperCase() ||
                                            "U"}
                                        </div>
                                      )}
                                    </div>
                                    <div className="user-info">
                                      <h4>
                                        {follower.user_public_profiles?.name}
                                      </h4>
                                      <p>
                                        @
                                        {
                                          follower.user_public_profiles
                                            ?.username
                                        }
                                      </p>
                                    </div>
                                    <div className="user-actions">
                                      <button
                                        className="profile-btn"
                                        onClick={() =>
                                          navigate(
                                            `/profile/${follower.follower_id}`
                                          )
                                        }
                                      >
                                        Profile
                                      </button>
                                      {!isFollowing(follower.follower_id) && (
                                        <button
                                          className="follow-btn"
                                          onClick={() =>
                                            handleFollowToggle(
                                              follower.follower_id,
                                              {
                                                id: follower.follower_id,
                                                name: follower
                                                  .user_public_profiles?.name,
                                                username:
                                                  follower.user_public_profiles
                                                    ?.username,
                                                avatar_url:
                                                  follower.user_public_profiles
                                                    ?.avatar_url,
                                              }
                                            )
                                          }
                                        >
                                          Follow Back
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="empty-state">
                                <div className="empty-icon">🔍</div>
                                <p>You don't have any followers yet</p>
                                <p className="empty-subtitle">
                                  Share your profile to attract followers!
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="discover-more-section">
                        <button
                          className="discover-people-btn"
                          onClick={() => navigate("/social/discover")}
                        >
                          <span className="btn-icon">🔍</span>
                          Discover More People
                        </button>
                      </div>
                    </>
                  )
                ) : (
                  <div className="guest-network-view">
                    <div className="section-header">
                      <h2>Our Community Members</h2>
                      <p>
                        Join our community to connect with movie enthusiasts
                      </p>
                    </div>

                    <div className="community-preview">
                      <div className="community-image">
                        <img
                          src="/community-illustration.png"
                          alt="Movie community"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentNode.classList.add("fallback-image");
                          }}
                        />
                      </div>

                      <div className="community-benefits">
                        <h3>Join our community to:</h3>
                        <ul>
                          <li>Follow other movie enthusiasts</li>
                          <li>Share your movie collections</li>
                          <li>Get personalized recommendations</li>
                          <li>Discuss your favorite films</li>
                        </ul>

                        <div className="join-actions">
                          <button
                            className="signup-btn primary"
                            onClick={() => navigate("/register")}
                          >
                            Join our community
                          </button>
                          <button
                            className="login-btn secondary"
                            onClick={() => navigate("/login")}
                          >
                            Sign In
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {currentUser && (
                  <div className="discover-more-section">
                    <button
                      className="discover-people-btn"
                      onClick={() => navigate("/social/discover")}
                    >
                      <span className="btn-icon">🔍</span>
                      Discover More People
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "lists" && (
              <div className="lists-section">
                <div className="section-header">
                  <h2>Public Movie Lists</h2>
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search lists..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsSearching(e.target.value.length > 0);
                      }}
                      className="search-input"
                    />
                    {searchQuery && (
                      <button
                        className="clear-search"
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearching(false);
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {isSearching && (
                  <div className="search-results-header">
                    <h3>
                      {filteredLists.length === 0
                        ? "No lists found"
                        : `Found ${filteredLists.length} list${
                            filteredLists.length === 1 ? "" : "s"
                          }`}
                    </h3>
                  </div>
                )}

                {filteredLists.length > 0 ? (
                  <div className="public-lists-grid">
                    {filteredLists.map((list) => (
                      <div key={list.id} className="list-card">
                        <div className="list-header">
                          <h4>{list.title}</h4>
                          <span className="movie-count">
                            {list.SharedListMovies?.length || 0} movies
                          </span>
                        </div>

                        <p className="list-description">
                          {list.description || "No description provided"}
                        </p>

                        <div className="list-movies">
                          {list.SharedListMovies?.slice(0, 3).map(
                            (item, index) => (
                              <div
                                key={`${list.id}-${item.movie_id}-${index}`}
                                className="movie-poster"
                              >
                                <img
                                  src={
                                    item.Movies?.poster_url ||
                                    "/placeholder.jpg"
                                  }
                                  alt={item.Movies?.title}
                                  onClick={() =>
                                    navigate(`/movies/${item.movie_id}`)
                                  }
                                />
                              </div>
                            )
                          )}
                          {list.SharedListMovies?.length > 3 && (
                            <div className="more-count">
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
                                  alt={`${list.user_public_profiles.name || list.user_public_profiles.username}'s avatar`}
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
                              onClick={() =>
                                navigate(`/profile/${list.user_id}`)
                              }
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
                  <div className="empty-state">
                    {isSearching ? (
                      <>
                        <div className="empty-icon">🔍</div>
                        <h3>No Results Found</h3>
                        <p>No lists matching "{searchQuery}"</p>
                        <button
                          className="clear-search-btn"
                          onClick={() => {
                            setSearchQuery("");
                            setIsSearching(false);
                          }}
                        >
                          Clear Search
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="empty-icon">📋</div>
                        <h3>No Public Lists Yet</h3>
                        <p>
                          Be the first to share your movie collection with the
                          community!
                        </p>
                        {currentUser ? (
                          <button
                            className="create-list-btn"
                            onClick={() => navigate("/shared-lists")}
                          >
                            Create Your First List
                          </button>
                        ) : (
                          <div className="auth-buttons">
                            <button
                              className="login-btn"
                              onClick={() => navigate("/login")}
                            >
                              Log In
                            </button>
                            <button
                              className="signup-btn"
                              onClick={() => navigate("/register")}
                            >
                              Sign Up
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
