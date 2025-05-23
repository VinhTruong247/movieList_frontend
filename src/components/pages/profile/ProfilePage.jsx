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
          navigate("/login");
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

  if (loading) return <div className="loading">Loading...</div>;
  if (!userData) return <div className="loading">No user data available</div>;

  return (
    <div className="profile-container">
      <div className="profile-content">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-section">
          <div className="section-header">
            <h2>Account Information</h2>
            {!isEditing && (
              <button
                className="edit-button"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

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
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="save-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <span className="label">Username</span>
                <span className="value">{userData.username}</span>
              </div>
              <div className="info-item">
                <span className="label">Email</span>
                <span className="value">{userData.email}</span>
              </div>
              <div className="info-item">
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

        <div className="profile-section">
          <h2>My Favorites</h2>
          {loadingFavorites ? (
            <div className="loading">Loading favorites...</div>
          ) : syncedFavorites.length > 0 ? (
            <div className="favorites-grid">
              {syncedFavorites.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="no-favorites">You haven't added any favorites yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
