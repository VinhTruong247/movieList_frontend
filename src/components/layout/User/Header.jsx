import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import { MovieContext } from "../../../context/MovieContext";
import { useAuth } from "../../../hooks/useAuth";
import { useFavorites } from "../../../hooks/useFavorites";
import "./styles/Header.scss";

const Header = () => {
  const navigate = useNavigate();
  const context = useContext(MovieContext);
  const { currentUser, loading } = context;
  const { logout, isAdmin } = useAuth();
  const { syncedFavorites } = useFavorites();

  const favoritesCount = syncedFavorites?.length || 0;

  const handleLogout = async () => {
    const result = await logout(navigate);
    if (result.success && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <header className="main-header">
        <div className="container">
          <nav className="nav-wrapper">
            <Link to="/" className="logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">Movie Collection</span>
            </Link>
            <div className="nav-links">
              <span className="loading-text">Loading...</span>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="main-header">
      <div className="container">
        <nav className="nav-wrapper">
          <Link to="/" className="logo">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">Movie Collection</span>
          </Link>

          <div className="nav-links">
            {currentUser && !isAdmin && (
              <Link to="/favorites" className="nav-link favorites-link">
                <span className="icon">❤️</span>
                <span className="text">Favorites</span>
                {favoritesCount > 0 && (
                  <span className="favorites-count">{favoritesCount}</span>
                )}
              </Link>
            )}

            {currentUser ? (
              <div className="user-menu">
                <span className="username">
                  Welcome,{" "}
                  {currentUser?.name ??
                    currentUser?.username ??
                    currentUser?.role}
                </span>
                {isAdmin ? (
                  <Link to="/admin" className="nav-link admin-link">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    to={`/profile/${currentUser.id}`}
                    className="nav-link profile-link"
                  >
                    <div className="header-avatar">
                      {currentUser.avatar_url ? (
                        <img
                          src={currentUser.avatar_url}
                          alt="Profile"
                          className="avatar-image"
                        />
                      ) : (
                        <div className="avatar-initial">
                          {(currentUser.name ||
                            currentUser.username ||
                            "?")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span>My Profile</span>
                  </Link>
                )}
                <button onClick={handleLogout} className="logout-btn">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-link login-link">
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
