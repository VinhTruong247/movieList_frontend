import { Link, useNavigate } from "react-router";
import { useAuth } from "../../../hooks/useAuth";
import "./styles/Header.scss";

const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      const result = await logout(navigate);
      if (result?.success && window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="admin-header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/admin" className="admin-logo">
            🎬 Admin Dashboard
          </Link>
        </div>

        <nav className="admin-nav">
          <Link to="/" className="nav-link">
            View Site
          </Link>
          <div className="admin-user">
            <button onClick={handleLogout} className="logout-btn">
              Sign Out
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
