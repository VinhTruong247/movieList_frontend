import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getCurrentUser, updateUser } from '../../../utils/UserListAPI';
import { useFavorites } from '../../../hooks/useFavorites';
import MovieCard from '../home/movieCard/MovieCard';
import './ProfilePage.scss';

const ProfilePage = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const { favorites } = useFavorites();
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
  });

  useEffect(() => {
    if (!currentUser || currentUser.role === 'admin') {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'username') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        ...currentUser,
        username: formData.username,
      };
      await updateUser(currentUser.id, updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      setError('');
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Failed to update profile');
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
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="disabled-input"
                  disabled
                  title="Email cannot be changed"
                />
              </div>

              <button type="submit" className="save-button">
                Save Changes
              </button>
            </form>
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
                  className={`value status ${currentUser.isDisable ? 'disabled' : 'active'}`}
                >
                  {currentUser.isDisable ? 'Disabled' : 'Active'}
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
