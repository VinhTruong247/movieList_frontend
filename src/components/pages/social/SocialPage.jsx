import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { useSocial } from "../../../hooks/useSocial";
import MovieCard from "../movie/movieCard/MovieCard";
import "./SocialPage.scss";

const SocialPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const currentUser = useSelector((state) => state.auth.currentUser);
  const movies = useSelector((state) => state.movies.items);

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
    if (currentUser) {
      loadUserSocialData(currentUser.id);
    }
    loadPublicLists(10);
  }, [currentUser, loadUserSocialData, loadPublicLists]);

  const getTrendingMovies = () => {
    if (!movies || movies.length === 0) return [];
    return [...movies]
      .filter((movie) => !movie.isDisabled)
      .sort((a, b) => b.imdb_rating - a.imdb_rating)
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
          (list.Users?.username &&
            list.Users.username
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      )
    : publicLists;
  const isLoading = followersLoading || followingLoading || listsLoading;

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
        {currentUser && (
          <button
            className={`nav-tab ${activeTab === "network" ? "active" : ""}`}
            onClick={() => setActiveTab("network")}
          >
            <span className="tab-icon">👥</span>
            My Network
            <span className="count-badge">
              {following.length + followers.length}
            </span>
          </button>
        )}
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
                        onClick={() => {
                          setActiveTab("trending");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        See All
                      </button>
                    </div>
                    <div className="trending-movies-grid">
                      {getTrendingMovies()
                        .slice(0, 4)
                        .map((movie) => (
                          <div key={movie.id} className="trending-movie-item">
                            <MovieCard movie={movie} viewMode="compact" />
                          </div>
                        ))}
                    </div>
                  </div>

                  {currentUser && following.length > 0 && (
                    <div className="network-preview">
                      <div className="preview-header">
                        <h3>People You Follow</h3>
                        <button
                          className="see-all-btn"
                          onClick={() => {
                            setActiveTab("network");
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
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
                        onClick={() => {
                          setActiveTab("lists");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        See All
                      </button>
                    </div>

                    {publicLists.length > 0 ? (
                      publicLists.slice(0, 2).map((list) => (
                        <div className="lists-preview-grid">
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
                                        navigate(`/movie/${item.movie_id}`)
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
                                  {list.Users?.avatar_url ? (
                                    <img
                                      src={list.Users.avatar_url}
                                      alt={`${list.Users.name || list.Users.username}'s avatar`}
                                    />
                                  ) : (
                                    <span>
                                      {(list.Users?.name ||
                                        list.Users?.username ||
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
                                  {list.Users?.name || list.Users?.username}
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
                        </div>
                      ))
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

                <div className="trending-movies-grid full-grid">
                  {getTrendingMovies().map((movie) => (
                    <div key={movie.id} className="trending-movie-item">
                      <MovieCard movie={movie} viewMode="grid" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "network" && currentUser && (
              <div className="network-section">
                <div className="network-grid">
                  <div className="network-column">
                    <div className="network-card">
                      <h3>People I Follow ({following.length})</h3>
                      {following.length > 0 ? (
                        <div className="user-list">
                          {following.map((follow) => (
                            <div key={follow.followee_id} className="user-item">
                              <div
                                className="user-avatar"
                                onClick={() =>
                                  navigate(`/profile/${follow.followee_id}`)
                                }
                              >
                                {follow.user_public_profiles?.avatar_url ? (
                                  <img
                                    src={follow.user_public_profiles.avatar_url}
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
                                <h4>{follow.user_public_profiles?.name}</h4>
                                <p>@{follow.user_public_profiles?.username}</p>
                              </div>
                              <div className="user-actions">
                                <button
                                  className="profile-btn"
                                  onClick={() =>
                                    navigate(`/profile/${follow.followee_id}`)
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
                            onClick={() => {
                              navigate(`/social/discover`);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
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
                                  navigate(`/profile/${follower.follower_id}`)
                                }
                              >
                                {follower.user_public_profiles?.avatar_url ? (
                                  <img
                                    src={
                                      follower.user_public_profiles.avatar_url
                                    }
                                    alt={follower.user_public_profiles.name}
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
                                <h4>{follower.user_public_profiles?.name}</h4>
                                <p>
                                  @{follower.user_public_profiles?.username}
                                </p>
                              </div>
                              <div className="user-actions">
                                <button
                                  className="profile-btn"
                                  onClick={() =>
                                    navigate(`/profile/${follower.follower_id}`)
                                  }
                                >
                                  Profile
                                </button>
                                {!isFollowing(follower.follower_id) && (
                                  <button
                                    className="follow-btn"
                                    onClick={() =>
                                      handleFollowToggle(follower.follower_id, {
                                        id: follower.follower_id,
                                        name: follower.user_public_profiles
                                          ?.name,
                                        username:
                                          follower.user_public_profiles
                                            ?.username,
                                        avatar_url:
                                          follower.user_public_profiles
                                            ?.avatar_url,
                                      })
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
                        : `Found ${filteredLists.length} list${filteredLists.length === 1 ? "" : "s"}`}
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
                                    navigate(`/movie/${item.movie_id}`)
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
                              {list.Users?.avatar_url ? (
                                <img
                                  src={list.Users.avatar_url}
                                  alt={`${list.Users.name || list.Users.username}'s avatar`}
                                />
                              ) : (
                                <span>
                                  {(list.Users?.name ||
                                    list.Users?.username ||
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
                              {list.Users?.name || list.Users?.username}
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
                        <p>No public lists available</p>
                        {currentUser && (
                          <button
                            className="create-list-btn"
                            onClick={() => navigate("/shared-lists")}
                          >
                            Create First List
                          </button>
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
