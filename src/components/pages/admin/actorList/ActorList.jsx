import { useState, useEffect, useMemo } from "react";
import {
  getActorsWithMovieCount,
  createActor,
  updateActor,
  toggleActorStatus,
} from "../../../../services/ActorsAPI";
import ActorFormPopup from "./actorForm/ActorFormPopup";
import "../ListStyle.scss";

const ActorList = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    moviesMin: "",
    moviesMax: "",
  });
  const [filterErrors, setFilterErrors] = useState({
    moviesMin: "",
    moviesMax: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [showActorForm, setShowActorForm] = useState(false);
  const [editingActor, setEditingActor] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchActors();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message, type = "success") => {
    setNotification({
      show: true,
      message,
      type,
    });
  };

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

  const fetchActors = async () => {
    setLoading(true);
    try {
      const actorsWithCounts = await getActorsWithMovieCount(true);
      setActors(actorsWithCounts);
      setError(null);
    } catch (err) {
      console.error("Error fetching actors:", err);
      setError("Failed to load actors");
      showNotification("Failed to load actors", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredActors = useMemo(() => {
    let result = [...actors];

    if (searchQuery) {
      const searchedText = searchQuery.toLowerCase();
      result = result.filter(
        (actor) =>
          actor.name?.toLowerCase().includes(searchedText) ||
          actor.nationality?.toLowerCase().includes(searchedText)
      );
    }

    if (filters.status) {
      if (filters.status === "active") {
        result = result.filter((actor) => !actor.isDisabled);
      } else if (filters.status === "disabled") {
        result = result.filter((actor) => actor.isDisabled);
      }
    }
    if (filters.moviesMin) {
      const minCount = parseInt(filters.moviesMin);
      result = result.filter((actor) => actor.movieCount >= minCount);
    }
    if (filters.moviesMax) {
      const maxCount = parseInt(filters.moviesMax);
      result = result.filter((actor) => actor.movieCount <= maxCount);
    }
    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === "movieCount") {
          const aCount = parseFloat(a.movieCount) || 0;
          const bCount = parseFloat(b.movieCount) || 0;
          return sortConfig.direction === "asc"
            ? aCount - bCount
            : bCount - aCount;
        }

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
  }, [actors, searchQuery, sortConfig, filters]);

  const paginatedActors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredActors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredActors, currentPage]);

  const pageCount = Math.ceil(filteredActors.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    validateField(name, value);
    setCurrentPage(1);
  };

  const validateField = (name, value) => {
    const errors = { ...filterErrors };
    if (!value) {
      errors[name] = "";
      setFilterErrors(errors);
      return;
    }
    if (name === "moviesMin" || name === "moviesMax") {
      if (!/^\d+$/.test(value)) {
        errors[name] = "Please enter numbers only";
        setFilterErrors(errors);
        return;
      }
      const numValue = parseInt(value);
      if (name === "moviesMin") {
        if (numValue < 0) {
          errors.moviesMin = "Minimum cannot be negative";
        } else if (
          filters.moviesMax &&
          numValue > parseInt(filters.moviesMax)
        ) {
          errors.moviesMin = "Minimum cannot exceed maximum";
        } else {
          errors.moviesMin = "";
        }
        if (filters.moviesMax && parseInt(filters.moviesMax) < numValue) {
          errors.moviesMax = "Maximum must be greater than minimum";
        } else if (filters.moviesMax) {
          errors.moviesMax = "";
        }
      }
      if (name === "moviesMax") {
        if (numValue < 0) {
          errors.moviesMax = "Maximum cannot be negative";
        } else if (
          filters.moviesMin &&
          numValue < parseInt(filters.moviesMin)
        ) {
          errors.moviesMax = "Maximum must be greater than minimum";
        } else {
          errors.moviesMax = "";
        }
        if (filters.moviesMin && parseInt(filters.moviesMin) > numValue) {
          errors.moviesMin = "Minimum cannot exceed maximum";
        } else if (filters.moviesMin) {
          errors.moviesMin = "";
        }
      }
    }

    setFilterErrors(errors);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "",
      moviesMin: "",
      moviesMax: "",
    });
    setFilterErrors({
      moviesMin: "",
      moviesMax: "",
    });
    setCurrentPage(1);
  };

  const refreshActors = async () => {
    setLoading(true);
    await fetchActors();
    showNotification("Actors list refreshed");
  };

  const handleAddActor = () => {
    setEditingActor(null);
    setShowActorForm(true);
  };

  const handleEditActor = (actor) => {
    setEditingActor(actor);
    setShowActorForm(true);
  };

  const handleCloseForm = () => {
    setShowActorForm(false);
    setEditingActor(null);
  };

  const handleToggleStatus = async (actor) => {
    const action = actor.isDisabled ? "enable" : "disable";

    if (window.confirm(`Are you sure you want to ${action} this actor?`)) {
      try {
        await toggleActorStatus(actor.id, !actor.isDisabled);
        setActors(
          actors.map((a) =>
            a.id === actor.id ? { ...a, isDisabled: !actor.isDisabled } : a
          )
        );
        showNotification(`Actor ${action}d successfully`);
      } catch (err) {
        console.error(`Error ${action}ing actor:`, err);
        showNotification(`Failed to ${action} actor: ${err.message}`, "error");
      }
    }
  };

  const handleSubmitActor = async (values, { setSubmitting, resetForm }) => {
    setIsSubmitting(true);
    try {
      if (editingActor) {
        const updatedActor = await updateActor(editingActor.id, values);
        setActors(
          actors.map((a) =>
            a.id === editingActor.id
              ? { ...updatedActor, movieCount: a.movieCount }
              : a
          )
        );
        showNotification("Actor updated successfully");
      } else {
        const newActor = await createActor(values);
        setActors([...actors, { ...newActor, movieCount: 0 }]);
        showNotification("Actor created successfully");
      }
      resetForm();
      setShowActorForm(false);
    } catch (err) {
      console.error("Error saving actor:", err);
      showNotification(`Failed to save actor: ${err.message}`, "error");
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading actors...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="list-section">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="list-header">
        <div className="header-title">
          <h2>Actor Management</h2>
          <button onClick={refreshActors} className="refresh-btn">
            ↻
          </button>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Name or Nationality..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <button
            className="filter-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
          <button onClick={handleAddActor} className="add-btn">
            Add New Actor
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filter-panel">
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
          <div className="filter-group">
            <label>Min Movies</label>
            <input
              type="number"
              name="moviesMin"
              value={filters.moviesMin}
              onChange={handleFilterChange}
              placeholder="Min"
              min="0"
              className={filterErrors.moviesMin ? "input-error" : ""}
            />
            {filterErrors.moviesMin && (
              <div className="error-text">{filterErrors.moviesMin}</div>
            )}
          </div>
          <div className="filter-group">
            <label>Max Movies</label>
            <input
              type="number"
              name="moviesMax"
              value={filters.moviesMax}
              onChange={handleFilterChange}
              placeholder="Max"
              min="0"
              className={filterErrors.moviesMax ? "input-error" : ""}
            />
            {filterErrors.moviesMax && (
              <div className="error-text">{filterErrors.moviesMax}</div>
            )}
          </div>
          <button className="reset-filter-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      )}

      {showActorForm && (
        <ActorFormPopup
          actor={editingActor}
          onSubmit={handleSubmitActor}
          onClose={handleCloseForm}
          isSubmitting={isSubmitting}
        />
      )}

      <div className="table-container">
        <table className="table-data">
          <thead>
            <tr>
              <th onClick={() => requestSort("name")} className="sortable">
                Name{getSortIndicator("name")}
              </th>
              <th
                onClick={() => requestSort("nationality")}
                className="sortable"
              >
                Nationality{getSortIndicator("nationality")}
              </th>
              <th>Status</th>
              <th
                onClick={() => requestSort("movieCount")}
                className="sortable"
              >
                Movie(s){getSortIndicator("movieCount")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedActors.length > 0 ? (
              paginatedActors.map((actor) => (
                <tr
                  key={actor.id}
                  className={actor.isDisabled ? "disabled-row" : ""}
                >
                  <td>
                    <div className="name-cell">
                      <span className="actor-name">{actor.name}</span>
                      {actor.isDisabled && (
                        <span className="disabled-indicator">(Disabled)</span>
                      )}
                    </div>
                  </td>
                  <td>{actor.nationality || "Not specified"}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        actor.isDisabled ? "disabled" : "active"
                      }`}
                    >
                      {actor.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td>{actor.movieCount || 0} movie(s)</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEditActor(actor)}
                      className="edit-btn"
                      title="Edit actor"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(actor)}
                      className={
                        actor.isDisabled ? "enable-btn" : "disable-btn"
                      }
                      title={`${actor.isDisabled ? "Enable" : "Disable"} actor`}
                    >
                      {actor.isDisabled ? "Enable" : "Disable"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-row">
                  {actors.length > 0
                    ? "No actors found matching your criteria"
                    : "No actors found. Add your first actor!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredActors.length > ITEMS_PER_PAGE && (
        <div className="table-footer">
          <div className="results-count">
            Showing {paginatedActors.length} of {filteredActors.length} actors
          </div>

          <div className="pagination">
            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            {Array.from({ length: pageCount }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? "active" : ""}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pageCount}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActorList;
