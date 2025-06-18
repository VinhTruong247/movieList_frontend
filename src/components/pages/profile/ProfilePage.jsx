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

        const favData = await getUserFavorites(userId);

        if (favData) {
          const favMovies = favData
            .map((item) => item.Movies)
            .filter(
              (movie) =>
                movie && (!movie.isDisabled || currentUser?.role === "admin")
            );

          setProfileFavorites(favMovies);
        }
      } else if (currentUser) {
        const user = await getCurrentUser();
        if (user?.userData?.role === "admin") {
          navigate("/admin");
          return;
        }
        setUserData(user.userData);
        setAvatarUrl(user.userData.avatar_url || "");
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
  }, [userId, currentUser, navigate]);

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
            <div className="join-date">
              Member since {new Date(userData.created_at).toLocaleDateString()}
            </div>
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

        <div className="profile-section favorites-section">
          <div className="section-header">
            <div className="section-title">
              <div className="section-icon">❤️</div>
              <h2>
                {isOwnProfile
                  ? "My Favorites"
                  : `${userData.name || userData.username}'s Favorites`}
              </h2>
            </div>
            {displayFavorites.length > 0 && (
              <div className="favorites-count">
                {displayFavorites.length}{" "}
                {displayFavorites.length === 1 ? "movie" : "movies"}
              </div>
            )}
          </div>

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
      </div>
    </div>
  );
};

export default ProfilePage;
