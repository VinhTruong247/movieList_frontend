import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../../../utils/UserListAPI';
import { useMovies } from '../../../hooks/useMovies';
import UserList from './userList/UserList';
import MovieList from './movieList/MovieList';
import './AdminPage.scss';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const { movies } = useMovies();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await fetchUsers();
        const filteredUsers = data.filter((user) => user.role !== 'admin');
        setUsers(filteredUsers);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="admin-dashboard">
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

      <div className="content-tabs">
        <button
          className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`tab-button ${activeTab === 'movies' ? 'active' : ''}`}
          onClick={() => setActiveTab('movies')}
        >
          Movie Management
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'users' ? <UserList /> : <MovieList />}
      </div>
    </div>
  );
};

export default AdminPage;
