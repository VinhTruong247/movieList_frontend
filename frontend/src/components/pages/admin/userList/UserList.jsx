import React, { useState, useEffect } from 'react';
import { fetchUsers, updateUser } from '../../../../utils/UserListAPI';
import './UserList.scss';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <h2>User Management</h2>
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
            {users.map(user => (
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
    </div>
  );
};

export default UserList;