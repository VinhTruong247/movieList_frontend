import { useState, useEffect, useRef, useCallback } from "react";
import { Formik, Form, Field } from "formik";
import { useNavigate, useParams } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import {
  getCurrentUser,
  updateUserProfile,
  getOwnOrPublicProfile,
} from "../../../services/UserListAPI";
import { useFavorites } from "../../../hooks/useFavorites";
import { getUserFavorites } from "../../../services/FarvoritesAPI";
import { fetchMovies } from "../../../redux/slices/moviesSlice";
import MovieCard from "../movie/movieCard/MovieCard";
import { ProfileSchema } from "../../auth/Validation";
import { useToast } from "../../../hooks/useToast";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  checkIfFollowing,
  getSharedLists,
} from "../../../services/SocialAPI";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const { userId } = useParams();
  const toastShown = useRef(false);

  const [userData, setUserData] = useState(null);
  const [profileFavorites, setProfileFavorites] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [sharedLists, setSharedLists] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState("favorites");

  const currentUser = useSelector((state) => state.auth.currentUser);
  const { syncedFavorites, loadingFavorites } = useFavorites();

  const isOwnProfile =
    currentUser?.userId === userId || (!userId && currentUser);

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      if (userId) {
        const profileData = await getOwnOrPublicProfile(userId);

        if (!profileData) {
          navigate("/not-found");
          return;
        }

        setUserData(profileData);
        setAvatarUrl(profileData.avatar_url || "");

        const [favData, followersData, followingData, listsData] = await Promise.all([
          getUserFavorites(userId),
          getFollowers(userId),
          getFollowing(userId),
          getSharedLists(userId, !isOwnProfile ? true : null),
        ]);

        if (favData) {
          const favMovies = favData
            .map((item) => item.Movies)
            .filter(
              (movie) =>
                movie && (!movie.isDisabled || currentUser?.role === "admin")
            );

          setProfileFavorites(favMovies);
        }

        setFollowers(followersData);
        setFollowing(followingData);
        setSharedLists(listsData);

        if (currentUser && currentUser.userId !== userId) {
          const following = await checkIfFollowing(currentUser.userId, userId);
          setIsFollowing(following);
        }
      } else if (currentUser) {
        const user = await getCurrentUser();
        if (user?.userData?.role === "admin") {
          navigate("/admin");
          return;
        }
        setUserData(user.userData);
        setAvatarUrl(user.userData.avatar_url || "");

        const [followersData, followingData, listsData] = await Promise.all([
          getFollowers(currentUser.userId),
          getFollowing(currentUser.userId),
          getSharedLists(currentUser.userId),
        ]);

        setFollowers(followersData);
        setFollowing(followingData);
        setSharedLists(listsData);
      } else {
        setError("User not found");
        if (!toastShown.current) {
          toast.error("User not found");
          toastShown.current = true;
        }
        return;
      }
    } catch (err) {
      console.error("Error loading profile data:", err);
      setError("Failed to load profile data");
      if (!toastShown.current) {
        toast.error("Failed to load profile data");
        toastShown.current = true;
      }
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser, navigate, isOwnProfile]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleSubmit = async (values) => {
    try {
      const updates = {
        username: values.username,
        name: values.name || values.username,
        avatar_url: values.avatar_url || avatarUrl,
      };

      await updateUserProfile(userData.userId, updates);

      setUserData({
        ...userData,
        ...updates,
      });

      dispatch(fetchMovies(currentUser?.role === "admin"));

      setSuccessMessage("Profile updated successfully!");
      toast.success("Profile updated successfully!");
      setIsEditing(false);

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile. Please try again.");
      toast.error("Failed to update profile");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      if (isFollowing) {
        await unfollowUser(currentUser.userId, userId);
        setIsFollowing(false);
        setFollowers(prev => prev.filter(f => f.follower_id !== currentUser.userId));
      } else {
        await followUser(currentUser.userId, userId);
        setIsFollowing(true);
        setFollowers(prev => [...prev, {
          follower_id: currentUser.userId,
          Users: {
            id: currentUser.userId,
            username: currentUser.username,
            name: currentUser.name,
            avatar_url: currentUser.avatar_url
          }
        }]);
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      toast.error("Failed to update follow status");
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  const displayFavorites = isOwnProfile ? syncedFavorites : profileFavorites;
  const isLoadingFavorites = isOwnProfile ? loadingFavorites : loading;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button
          className="back-button"
          onClick={() => navigate("/")}
          title="Back to Home"
        >
          <svg
            viewBox="0 0 24 24"
            className="home-icon"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </button>
        <div className="page-title-section">
          <h1 className="profile-title">
            {isOwnProfile
              ? "My Profile"
              : `${userData.name || userData.username}'s Profile`}
          </h1>
          <p className="profile-subtitle">
            {isOwnProfile
              ? "Manage your account settings"
              : "View profile and favorites"}
          </p>
        </div>
      </div>

      <div className="profile-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="profile-section avatar-section">
          <div className="avatar-container">
            {userData.avatar_url ? (
              <img
                src={userData.avatar_url}
                alt={`${userData.name || userData.username}'s avatar`}
                className="profile-avatar"
              />
            ) : (
              <div className="default-avatar">
                <span>
                  {(userData.name || userData.username || "?")[0].toUpperCase()}
                </span>
              </div>
            )}
          </div>

          <div className="user-meta">
            <h2 className="user-displayname">
              {userData.name || userData.username}
            </h2>
            {isOwnProfile && (
              <p className="username-display">@{userData.username}</p>
            )}

            <div className="social-stats">
              <div className="stat">
                <span className="count">{followers.length}</span>
                <span className="label">Followers</span>
              </div>
              <div className="stat">
                <span className="count">{following.length}</span>
                <span className="label">Following</span>
              </div>
              <div className="stat">
                <span className="count">{sharedLists.length}</span>
                <span className="label">Lists</span>
              </div>
            </div>

            <div className="join-date">
              Member since {new Date(userData.created_at).toLocaleDateString()}
            </div>

            {!isOwnProfile && currentUser && (
              <button
                className={`follow-btn ${isFollowing ? "following" : ""}`}
                onClick={handleFollowToggle}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>

        <div className="profile-section account-section">
          <div className="section-header">
            <div className="section-title">
              <div className="section-icon">👤</div>
              <h2>Account Information</h2>
            </div>
            {isOwnProfile && !isEditing && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                <span className="button-icon">✏️</span>
                <span className="button-text">Edit Profile</span>
              </button>
            )}
          </div>

          {isOwnProfile && isEditing ? (
            <Formik
              initialValues={{
                username: userData.username || "",
                name: userData.name || "",
                avatar_url: userData.avatar_url || "",
              }}
              validationSchema={ProfileSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className="profile-form">
                  <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <Field
                      type="text"
                      name="username"
                      userId="username"
                      className={
                        errors.username && touched.username ? "error" : ""
                      }
                    />
                    {errors.username && touched.username && (
                      <div className="error-text">{errors.username}</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label htmlFor="name">Display Name</label>
                    <Field type="text" name="name" userId="name" />
                  </div>

                  <div className="form-group">
                    <label htmlFor="avatar_url">Avatar URL</label>
                    <Field
                      type="text"
                      name="avatar_url"
                      userId="avatar_url"
                      placeholder="https://example.com/your-image.jpg"
                    />
                    <div className="field-help">
                      Enter a URL to an image for your profile avatar
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={() => setIsEditing(false)}
                    >
                      <span className="button-icon">✕</span>
                      <span className="button-text">Cancel</span>
                    </button>
                    <button
                      type="submit"
                      className={`save-button ${isSubmitting ? "loading" : ""}`}
                      disabled={isSubmitting}
                    >
                      <span className="button-icon">💾</span>
                      <span className="button-text">
                        {isSubmitting ? "Saving..." : "Save Changes"}
                      </span>
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <div className="info-icon">📧</div>
                <div className="info-content">
                  <span className="label">Email</span>
                  <span className="value">
                    {isOwnProfile ? userData.email : "•••••••••••••"}
                  </span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">👤</div>
                <div className="info-content">
                  <span className="label">Username</span>
                  <span className="value">
                    {isOwnProfile ? userData.username : "•••••••••••••"}
                  </span>
                </div>
              </div>

              {isOwnProfile && (
                <div className="info-item">
                  <div className="info-icon">🔒</div>
                  <div className="info-content">
                    <span className="label">Account Status</span>
                    <span
                      className={`value status ${
                        userData.isDisabled ? "disabled" : "active"
                      }`}
                    >
                      {userData.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-section social-section">
          <div className="section-header">
            <div className="section-title">
              <div className="section-icon">🎬</div>
              <h2>
                {isOwnProfile ? "My Content" : `${userData.name || userData.username}'s Content`}
              </h2>
            </div>
          </div>

          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === "favorites" ? "active" : ""}`}
              onClick={() => setActiveTab("favorites")}
            >
              <span className="tab-icon">❤️</span>
              Favorites
              {displayFavorites.length > 0 && (
                <span className="tab-count">{displayFavorites.length}</span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === "lists" ? "active" : ""}`}
              onClick={() => setActiveTab("lists")}
            >
              <span className="tab-icon">📋</span>
              Shared Lists
              {sharedLists.length > 0 && (
                <span className="tab-count">{sharedLists.length}</span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === "followers" ? "active" : ""}`}
              onClick={() => setActiveTab("followers")}
            >
              <span className="tab-icon">👥</span>
              Followers
              {followers.length > 0 && (
                <span className="tab-count">{followers.length}</span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === "following" ? "active" : ""}`}
              onClick={() => setActiveTab("following")}
            >
              <span className="tab-icon">👤</span>
              Following
              {following.length > 0 && (
                <span className="tab-count">{following.length}</span>
              )}
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "favorites" && (
              <div className="favorites-content">
                {isLoadingFavorites ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading favorites...</p>
                  </div>
                ) : displayFavorites.length > 0 ? (
                  <div className="favorites-grid">
                    {displayFavorites.map((movie, index) => (
                      <div
                        key={movie.userId}
                        className="favorite-item"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <MovieCard movie={movie} viewMode="grid" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-favorites">
                    <div className="empty-icon">💔</div>
                    <h3>
                      {isOwnProfile
                        ? "No favorites yet"
                        : `${userData.name || userData.username} hasn't added any favorites yet`}
                    </h3>
                    <p>
                      {isOwnProfile
                        ? "Start building your collection by adding movies to your favorites!"
                        : "Check back later to see what movies they've added."}
                    </p>
                    {isOwnProfile && (
                      <button className="browse-button" onClick={() => navigate("/")}>
                        <span className="button-icon">🎬</span>
                        <span className="button-text">Browse Movies</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "lists" && (
              <div className="shared-lists-content">
                {sharedLists.length > 0 ? (
                  <div className="lists-grid">
                    {sharedLists.map((list) => (
                      <div key={list.id} className="list-card">
                        <h3>{list.title}</h3>
                        {list.description && <p>{list.description}</p>}
                        <div className="list-movies">
                          {list.SharedListMovies?.slice(0, 3).map((item) => (
                            <div key={item.movie_id} className="movie-poster">
                              <img
                                src={item.Movies?.poster_url || "/placeholder.jpg"}
                                alt={item.Movies?.title}
                              />
                            </div>
                          ))}
                          {list.SharedListMovies?.length > 3 && (
                            <div className="more-count">
                              +{list.SharedListMovies.length - 3}
                            </div>
                          )}
                        </div>
                        <div className="list-meta">
                          <span>{list.SharedListMovies?.length || 0} movies</span>
                          <span>{new Date(list.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="empty-icon">📋</div>
                    <h3>No shared lists yet</h3>
                    <p>
                      {isOwnProfile 
                        ? "Create your first shared list to showcase your movie collections!"
                        : "This user hasn't created any public lists yet."}
                    </p>
                    {isOwnProfile && (
                      <button 
                        className="browse-button" 
                        onClick={() => navigate("/shared-lists")}
                      >
                        <span className="button-icon">➕</span>
                        <span className="button-text">Create List</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "followers" && (
              <div className="followers-content">
                {followers.length > 0 ? (
                  <div className="user-list">
                    {followers.map((follower) => (
                      <div key={follower.follower_id} className="user-item">
                        <div className="user-avatar">
                          {follower.Users?.avatar_url ? (
                            <img src={follower.Users.avatar_url} alt={follower.Users.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {follower.Users?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <h4>{follower.Users?.name}</h4>
                          <p>@{follower.Users?.username}</p>
                        </div>
                        <button
                          className="view-profile-btn"
                          onClick={() => navigate(`/profile/${follower.follower_id}`)}
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="empty-icon">👥</div>
                    <h3>No followers yet</h3>
                    <p>
                      {isOwnProfile 
                        ? "Share your movie lists to attract followers!"
                        : "This user doesn't have any followers yet."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "following" && (
              <div className="following-content">
                {following.length > 0 ? (
                  <div className="user-list">
                    {following.map((follow) => (
                      <div key={follow.followee_id} className="user-item">
                        <div className="user-avatar">
                          {follow.Users?.avatar_url ? (
                            <img src={follow.Users.avatar_url} alt={follow.Users.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {follow.Users?.name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                        <div className="user-info">
                          <h4>{follow.Users?.name}</h4>
                          <p>@{follow.Users?.username}</p>
                        </div>
                        <button
                          className="view-profile-btn"
                          onClick={() => navigate(`/profile/${follow.followee_id}`)}
                        >
                          View Profile
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="empty-icon">👤</div>
                    <h3>Not following anyone yet</h3>
                    <p>
                      {isOwnProfile 
                        ? "Discover other users and follow them to see their movie collections!"
                        : "This user isn't following anyone yet."}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
