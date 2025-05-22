import { useState, useEffect, useMemo } from "react";
import supabase from "../../../../supabase-client";
import "./UserList.scss";

const ITEMS_PER_PAGE = 10;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchUser, setSearchUser] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [processingUsers, setProcessingUsers] = useState([]);

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

  const filteredUsers = useMemo(() => {
    let result = [...users].sort((a, b) => a.email.localeCompare(b.email));

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
      } catch (err) {
        console.error(`Failed to ${message} user:`, err);
        setError(`Failed to ${message} user`);
      } finally {
        setProcessingUsers((prev) => prev.filter((id) => id !== user.id));
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
            placeholder="Search by Username, Name or Email..."
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
              <th>Username</th>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedUsers.map((user) => (
              <tr
                key={user.id}
                className={user.isDisabled ? "disabled-row" : ""}
              >
                <td>{user.username ? user.username : <em>Unidentified</em>}</td>
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
                <td>
                  <button
                    className={`toggle-btn ${
                      user.isDisabled ? "enable" : "disable"
                    }`}
                    onClick={() => handleToggleDisable(user)}
                    disabled={processingUsers.includes(user.id)}
                  >
                    {processingUsers.includes(user.id)
                      ? "Processing..."
                      : user.isDisabled
                        ? "Enable"
                        : "Disable"}
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
  );
};

export default UserList;
