import React, { useState, useEffect, useMemo } from 'react';
import { fetchUsers, updateUser } from '../../../../utils/UserListAPI';
import './UserList.scss';

const ITEMS_PER_PAGE = 10;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchUser, setSearchUser] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      const filteredUsers = data.filter(user => user.role !== 'admin');
      setUsers(filteredUsers);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = [...users].sort((a, b) => Number(a.id) - Number(b.id));

    if (searchUser) {
      const searchQuery = searchUser.toLowerCase();
      result = result.filter(user =>
        user.id.toLowerCase().includes(searchQuery) ||
        user.username.toLowerCase().includes(searchQuery) ||
        user.email.toLowerCase().includes(searchQuery)
      );
    }
    return result;
  }, [users, searchUser]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchUser]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleToggleDisable = async (user) => {
    const message = user.isDisable ? 'enable' : 'disable';
    if (window.confirm(`Are you sure you want to ${message} this user?`)) {
      try {
        const updatedUser = {
          ...user,
          isDisable: !user.isDisable
        };
        await updateUser(user.id, updatedUser);
        setUsers(users.map(u => u.id === user.id ? updatedUser : u));
      } catch (err) {
        setError(`Failed to ${message} user`);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="user-list-section">
      <div className="list-header">
        <h2>User Management</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by ID, Username, or Email..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map(user => (
              <tr key={user.id} className={user.isDisable ? 'disabled-row' : ''}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`status-badge ${user.isDisable ? 'disabled' : 'active'}`}>
                    {user.isDisable ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td>
                  <button
                    className={`toggle-btn ${user.isDisable ? 'enable' : 'disable'}`}
                    onClick={() => handleToggleDisable(user)}
                  >
                    {user.isDisable ? 'Enable' : 'Disable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index + 1}
              className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}

          <button
            className="page-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default UserList;