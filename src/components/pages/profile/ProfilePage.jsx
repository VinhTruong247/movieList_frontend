import { useState, useEffect, useContext } from "react";
import { Formik, Form, Field } from "formik";
import { useNavigate } from "react-router";
import {
  getCurrentUser,
  updateUserProfile,
} from "../../../services/UserListAPI";
import { useFavorites } from "../../../hooks/useFavorites";
import MovieCard from "../home/movieCard/MovieCard";
import { ProfileSchema } from "../../auth/Validation";
import { MovieContext } from "../../../context/MovieContext";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const { syncedFavorites, loadingFavorites } = useFavorites();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { refreshMovies } = useContext(MovieContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        if (!user || !user.session) {
          navigate("/not-login");
          return;
        }

        if (user.userData?.role === "admin") {
          navigate("/admin");
          return;
        }

        setUserData(user.userData);
      } catch (err) {
        console.error("Error loading user data:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleSubmit = async (values) => {
    try {
      await updateUserProfile(userData.id, {
        username: values.username,
        name: values.name || values.username,
      });

      setUserData({
        ...userData,
        username: values.username,
        name: values.name || values.username,
      });

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      if (refreshMovies) {
        await refreshMovies();
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
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
          <p>No user data available</p>
        </div>
      </div>
    );
  }

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
          <h1 className="profile-title">My Profile</h1>
          <p className="profile-subtitle">Manage your account settings</p>
        </div>
      </div>

      <div className="profile-content">
        {error && <div className="error-message">{error}</div>}
        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <div className="profile-section account-section">
          <div className="section-header">
            <div className="section-title">
              <div className="section-icon">👤</div>
              <h2>Account Information</h2>
            </div>
            {!isEditing && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                <span className="button-icon">✏️</span>
                <span className="button-text">Edit Profile</span>
              </button>
            )}
          </div>

          {isEditing ? (
            <Formik
              initialValues={{
                username: userData.username || "",
                name: userData.name || "",
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
                      id="username"
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
                    <Field type="text" name="name" id="name" />
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
                  <span className="value">{userData.email}</span>
                </div>
              </div>
              
              <div className="info-item">
                <div className="info-icon">👤</div>
                <div className="info-content">
                  <span className="label">Username</span>
                  <span className="value">{userData.username}</span>
                </div>
              </div>

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
            </div>
          )}
        </div>

        <div className="profile-section favorites-section">
          <div className="section-header">
            <div className="section-title">
              <div className="section-icon">❤️</div>
              <h2>My Favorites</h2>
            </div>
            {syncedFavorites.length > 0 && (
              <div className="favorites-count">
                {syncedFavorites.length} {syncedFavorites.length === 1 ? 'movie' : 'movies'}
              </div>
            )}
          </div>
          
          {loadingFavorites ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading favorites...</p>
            </div>
          ) : syncedFavorites.length > 0 ? (
            <div className="favorites-grid">
              {syncedFavorites.map((movie, index) => (
                <div 
                  key={movie.id} 
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
              <h3>No favorites yet</h3>
              <p>Start building your collection by adding movies to your favorites!</p>
              <button
                className="browse-button"
                onClick={() => navigate("/")}
              >
                <span className="button-icon">🎬</span>
                <span className="button-text">Browse Movies</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;