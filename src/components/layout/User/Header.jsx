import { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { MovieContext } from "../../../context/MovieContext";
import { useFavorites } from "../../../hooks/useFavorites";
import { logoutUser, getCurrentUser } from "../../../services/UserListAPI";
import "./styles/Header.scss";

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useContext(MovieContext);
  const { syncedFavorites } = useFavorites();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isUserVerified, setIsUserVerified] = useState(false);

  const favoritesCount = syncedFavorites?.length || 0;

  useEffect(() => {
    const verifyUserSession = async () => {
      try {
        setIsAuthChecking(true);
        const userSession = await getCurrentUser();

        if (userSession && userSession.userData && !userSession.userData.isDisabled) {
          setCurrentUser(userSession.userData);
          setIsUserVerified(true);
        } else {
          setCurrentUser(null);
          setIsUserVerified(false);
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        setCurrentUser(null);
        setIsUserVerified(false);
      } finally {
        setIsAuthChecking(false);
      }
    };

    verifyUserSession();
  }, [setCurrentUser]);

  const handleLogout = async () => {
    try {
      await logoutUser(navigate);
      setCurrentUser(null);
      setIsUserVerified(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (isAuthChecking) {
    return (
      <header className="main-header">
        <div className="container">
          <nav className="nav-wrapper">
            <Link to="/" className="logo">
              <span className="logo-icon">🎬</span>
              <span className="logo-text">Movie Collection</span>
            </Link>
            <div className="nav-links">
              <span className="loading-text">Verifying session...</span>
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
            {currentUser && isUserVerified && currentUser.role !== "admin" && (
              <Link to="/favorites" className="nav-link favorites-link">
                <span className="icon">❤️</span>
                <span className="text">Favorites</span>
                {favoritesCount > 0 && (
                  <span className="favorites-count">{favoritesCount}</span>
                )}
              </Link>
            )}

            {currentUser && isUserVerified ? (
              <div className="user-menu">
                <span className="username">
                  Welcome,{" "}
                  {currentUser?.name ??
                    currentUser?.username ??
                    currentUser?.role}
                </span>
                {currentUser.role === "admin" ? (
                  <Link to="/admin" className="nav-link admin-link">
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link to="/profile" className="nav-link profile-link">
                    My Profile
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
