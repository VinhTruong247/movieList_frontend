import { useState, useEffect, useMemo } from "react";
import supabase from "../../../../supabase-client";
import "../ListStyle.scss";

const ITEMS_PER_PAGE = 10;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingUsers, setProcessingUsers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "email",
    direction: "asc",
  });
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from("Users")
          .select("*")
          .neq("role", "admin");

        if (error) throw error;

        if (isMounted) {
          setUsers(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load users:", err);
        if (isMounted) {
          setError("Failed to load users");
          setLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === "asc" ? " ▲" : " ▼";
    }
    return "";
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchUser) {
      const searchQuery = searchUser.toLowerCase();
      result = result.filter(
        (user) =>
          (user.username &&
            user.username.toLowerCase().includes(searchQuery)) ||
          (user.name && user.name.toLowerCase().includes(searchQuery)) ||
          (user.email && user.email.toLowerCase().includes(searchQuery))
      );
    }

    if (filters.role) {
      result = result.filter((user) => user.role === filters.role);
    }

    if (filters.status) {
      if (filters.status === "active") {
        result = result.filter((user) => !user.isDisabled);
      } else if (filters.status === "disabled") {
        result = result.filter((user) => user.isDisabled);
      }
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (typeof aValue === "string" && typeof bValue === "string") {
          const comparison = aValue.localeCompare(bValue);
          return sortConfig.direction === "asc" ? comparison : -comparison;
        } else {
          if (aValue < bValue) {
            return sortConfig.direction === "asc" ? -1 : 1;
          }
          if (aValue > bValue) {
            return sortConfig.direction === "asc" ? 1 : -1;
          }
          return 0;
        }
      });
    }

    return result;
  }, [users, searchUser, sortConfig, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      role: "",
      status: "",
    });
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchUser, filters]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleToggleDisable = async (user) => {
    const message = user.isDisabled ? "enable" : "disable";
    if (window.confirm(`Are you sure you want to ${message} this user?`)) {
      try {
        setProcessingUsers((prev) => [...prev, user.id]);

        const { error } = await supabase
          .from("Users")
          .update({
            isDisabled: !user.isDisabled,
          })
          .eq("id", user.id);

        if (error) throw error;

        setUsers(
          users.map((u) =>
            u.id === user.id ? { ...u, isDisabled: !u.isDisabled } : u
          )
        );

        setNotification({
          show: true,
          message: `User ${message}d successfully!`,
          type: "success",
        });
      } catch (err) {
        console.error(`Failed to ${message} user:`, err);
        setNotification({
          show: true,
          message: `Failed to ${message} user: ${err.message}`,
          type: "error",
        });
      } finally {
        setProcessingUsers((prev) => prev.filter((id) => id !== user.id));
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="list-section">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="list-header">
        <h2>User Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Username, Name or Email..."
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Role</label>
            <select
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <button className="reset-filter-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      <div className="table-container">
        <table className="table-data">
          <thead>
            <tr>
              <th onClick={() => requestSort("username")} className="sortable">
                Username{getSortIndicator("username")}
              </th>
              <th onClick={() => requestSort("email")} className="sortable">
                Email{getSortIndicator("email")}
              </th>
              <th onClick={() => requestSort("name")} className="sortable">
                Name{getSortIndicator("name")}
              </th>
              <th onClick={() => requestSort("role")} className="sortable">
                Role{getSortIndicator("role")}
              </th>
              <th
                onClick={() => requestSort("isDisabled")}
                className="sortable"
              >
                Status{getSortIndicator("isDisabled")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className={user.isDisabled ? "disabled-row" : ""}
                >
                  <td>
                    {user.username ? user.username : <em>Unidentified</em>}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.name ? user.name : <em>Unidentified</em>}</td>
                  <td>{user.role}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        user.isDisabled ? "disabled" : "active"
                      }`}
                    >
                      {user.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className={`action-btn ${
                        user.isDisabled ? "enable-btn" : "disable-btn"
                      }`}
                      onClick={() => handleToggleDisable(user)}
                      disabled={processingUsers.includes(user.id)}
                    >
                      {processingUsers.includes(user.id) ? (
                        <span className="loading-spinner"></span>
                      ) : user.isDisabled ? (
                        "Enable"
                      ) : (
                        "Disable"
                      )}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="no-results">
                  No users found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="results-count">
          Showing {paginatedUsers.length} of {filteredUsers.length} users
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
                className={`page-btn ${
                  currentPage === index + 1 ? "active" : ""
                }`}
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
    </div>
  );
};

export default UserList;
