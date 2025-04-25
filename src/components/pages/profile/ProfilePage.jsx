import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import { useNavigate } from "react-router";
import { getCurrentUser, updateUser } from "../../../utils/UserListAPI";
import { useFavorites } from "../../../hooks/useFavorites";
import MovieCard from "../home/movieCard/MovieCard";
import ChangePassword from "./ChangePassword";
import { ProfileSchema } from "../../auth/Validation";
import "./ProfilePage.scss";

const ProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { favorites } = useFavorites();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!currentUser || currentUser.role === "admin") {
      navigate("/");
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const updatedUser = {
        ...currentUser,
        username: values.username,
      };

      await updateUser(currentUser.id, updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setIsEditing(false);
      setError("");
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      {error && <div className="error-message">{error}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Profile Information</h2>
            <button
              className="edit-button"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {isEditing ? (
            <>
              <Formik
                initialValues={{
                  username: currentUser.username,
                  email: currentUser.email,
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
              >
                {({ errors, touched, isSubmitting }) => (
                  <Form className="profile-form">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <Field
                        id="username"
                        name="username"
                        type="text"
                        className={
                          errors.username && touched.username ? "error" : ""
                        }
                      />
                      {errors.username && touched.username && (
                        <div className="error-message">{errors.username}</div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        className="disabled-input"
                        disabled
                        title="Email cannot be changed"
                      />
                    </div>

                    <button
                      type="submit"
                      className="save-button"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </button>
                  </Form>
                )}
              </Formik>

              <ChangePassword
                currentUser={currentUser}
                onSuccess={setSuccessMessage}
                onError={setError}
              />
            </>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <span className="label">Username:</span>
                <span className="value">{currentUser.username}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">{currentUser.email}</span>
              </div>
              <div className="info-item">
                <span className="label">Account Status:</span>
                <span
                  className={`value status ${currentUser.isDisable ? "disabled" : "active"}`}
                >
                  {currentUser.isDisable ? "Disabled" : "Active"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h2>My Favorites</h2>
          {favorites.length > 0 ? (
            <div className="favorites-grid">
              {favorites.map((movie) => (
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
