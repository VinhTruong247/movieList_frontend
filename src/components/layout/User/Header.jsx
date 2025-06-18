import { useEffect, useState, useCallback, memo } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../../../hooks/useAuth";
import { useFavorites } from "../../../hooks/useFavorites";
import { useToast } from "../../../hooks/useToast";
import { fetchFavorites } from "../../../redux/slices/favoritesSlice";
import "./styles/Header.scss";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const toast = useToast();
  const currentUser = useSelector((state) => state.auth.currentUser);
  const loading = useSelector((state) => state.auth.loading);
  const { logout, isAdmin } = useAuth();
  const { syncedFavorites } = useFavorites();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const favoritesCount = syncedFavorites?.length || 0;

  useEffect(() => {
    if (currentUser?.id) {
      dispatch(fetchFavorites(currentUser.id));
    }
  }, [currentUser?.id, dispatch]);

  const handleLogout = useCallback(async () => {
    try {
      const result = await logout();
      if (result.success) {
        toast.success("Successfully logged out");
        navigate("/login", { replace: true });
      }
    } catch (error) {
      toast.error("Logout failed");
    }
  }, [logout, navigate, toast]);

  const toggleDropdown = useCallback(() => {
    setDropdownOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".user-dropdown")) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const isActive = useCallback(
    (path) => {
      return location.pathname === path;
    },
    [location.pathname]
  );

  if (loading) {
    return (
      <header className="main-header" role="banner">
        <div className="container">
          <nav className="nav-wrapper">
            <Link to="/" className="logo" aria-label="Movie Collection Home">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">Movie Collection</span>
            </Link>
            <div className="nav-placeholder" aria-label="Loading navigation">
              <span className="loading-text">Loading...</span>
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="main-header" role="banner">
      <div className="container">
        <nav className="nav-wrapper" role="navigation">
          <Link to="/" className="logo" aria-label="Movie Collection Home">
            <span className="logo-icon">🎬</span>
            <span className="logo-text">Movie Collection</span>
          </Link>

          <div className="nav-links">
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              <span className="icon">🏠</span>
              <span className="text">Home</span>
            </Link>
            <Link
              to="/movies"
              className={`nav-link ${isActive("/movies") ? "active" : ""}`}
            >
              <span className="icon">🎞️</span>
              <span className="text">Movies</span>
            </Link>
            <Link
              to="/"
              className={`nav-link ${isActive("/social") ? "active" : ""}`}
            >
              <span className="icon">👥</span>
              <span className="text">Social</span>
            </Link>

            {currentUser && (
              <Link
                to="/favorites"
                className={`nav-link favorites-link ${
                  isActive("/favorites") ? "active" : ""
                }`}
                aria-label={`Favorites (${favoritesCount} items)`}
              >
                <span className="icon">❤️</span>
                <span className="text">Favorites</span>
                {favoritesCount > 0 && (
                  <span className="favorites-count" aria-hidden="true">
                    {favoritesCount}
                  </span>
                )}
              </Link>
            )}

            {currentUser ? (
              <div className="user-dropdown">
                <button
                  onClick={toggleDropdown}
                  className="dropdown-trigger"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="header-avatar">
                    {currentUser.avatar_url ? (
                      <img
                        src={currentUser.avatar_url}
                        alt=""
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
                  <span className="username-display">
                    {currentUser.name || currentUser.username}
                  </span>
                  <span className="dropdown-arrow">
                    {dropdownOpen ? "▲" : "▼"}
                  </span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu" role="menu">
                    <Link
                      to={`/profile/${currentUser.id}`}
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="item-icon">👤</span>
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="dropdown-item admin-link"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <span className="item-icon">⚙️</span>
                        Admin Dashboard
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="dropdown-item logout-item"
                    >
                      <span className="item-icon">🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="nav-link login-link">
                <span className="icon">🔑</span>
                Sign In
              </Link>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default memo(Header);
