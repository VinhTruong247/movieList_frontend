import { useState, useEffect } from "react";
import supabase from "../../../supabase-client";
import { useMovies } from "../../../hooks/useMovies";
import UserList from "./userList/UserList";
import MovieList from "./movieList/MovieList";
import GenreList from "./genreList/GenreList";
import "./AdminPage.scss";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const { movies } = useMovies();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("Users")
          .select("*")
          .neq("role", "admin");

        if (error) throw error;

        setUsers(data || []);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const renderContent = () => {
    switch (activeSection) {
      case "users":
        return <UserList />;
      case "movies":
        return <MovieList />;
      case "genres":
        return <GenreList />;
      default:
        return (
          <>
            <div className="dashboard-header">
              <h1>Admin Dashboard</h1>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Total Users</h3>
                <p>{users.length}</p>
              </div>
              <div className="stat-card">
                <h3>Total Movies</h3>
                <p>{movies.length}</p>
              </div>
            </div>
          </>
        );
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-container">
      <div className="side-menu">
        <div className="menu-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="menu-items">
          <button
            className={`menu-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            <span className="icon">📊</span>
            Dashboard
          </button>
          <button
            className={`menu-item ${activeSection === "users" ? "active" : ""}`}
            onClick={() => setActiveSection("users")}
          >
            <span className="icon">👥</span>
            User Management
          </button>
          <button
            className={`menu-item ${activeSection === "movies" ? "active" : ""}`}
            onClick={() => setActiveSection("movies")}
          >
            <span className="icon">🎬</span>
            Movie Management
          </button>
          <button
            className={`menu-item ${activeSection === "genres" ? "active" : ""}`}
            onClick={() => setActiveSection("genres")}
          >
            <span className="icon">🏷️</span>
            Genre Management
          </button>
        </nav>
      </div>

      <div className="admin-content">{renderContent()}</div>
    </div>
  );
};

export default AdminPage;
