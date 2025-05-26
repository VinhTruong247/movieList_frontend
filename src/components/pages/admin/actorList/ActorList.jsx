import { useState, useEffect, useMemo } from "react";
import supabase from "../../../../supabase-client";
import ActorForm from "./actorForm/ActorForm";
import "./ActorList.scss";

const ActorList = () => {
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingActor, setEditingActor] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
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

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

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

  const fetchActors = async () => {
    setLoading(true);
    try {
      const { data: actorsData, error: actorsError } = await supabase
        .from("Actors")
        .select("*")
        .order("name");

      if (actorsError) throw actorsError;
      const { data: movieCountsData, error: movieCountsError } =
        await supabase.rpc("get_actors_with_movie_count");
      if (movieCountsError) throw movieCountsError;
      const movieCountMap = {};
      if (movieCountsData) {
        movieCountsData.forEach((item) => {
          movieCountMap[item.actor_id] = item.movie_count;
        });
      }
      const actorsWithCounts = actorsData.map((actor) => ({
        ...actor,
        movieCount: movieCountMap[actor.id] || 0,
      }));

      setActors(actorsWithCounts);
    } catch (err) {
      console.error("Error fetching actors:", err);
      setError("Failed to load actors");
    } finally {
      setLoading(false);
    }
  };

  const filteredActors = useMemo(() => {
    let result = [...actors];
    if (searchQuery) {
      const searchedText = searchQuery.toLowerCase();
      result = result.filter((actor) =>
        actor.name?.toLowerCase().includes(searchedText)
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

    return result;
  }, [actors, searchQuery, filters]);

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

  const handleAddActor = () => {
    setEditingActor(null);
    setShowForm(true);
  };

  const handleEditActor = (actor) => {
    setEditingActor(actor);
    setShowForm(true);
  };

  const handleToggleStatus = async (actor) => {
    const action = actor.isDisabled ? "enable" : "disable";

    if (window.confirm(`Are you sure you want to ${action} this actor?`)) {
      try {
        const { error } = await supabase
          .from("Actors")
          .update({ isDisabled: !actor.isDisabled })
          .eq("id", actor.id);

        if (error) throw error;

        setActors(
          actors.map((a) =>
            a.id === actor.id ? { ...a, isDisabled: !actor.isDisabled } : a
          )
        );

        setNotification({
          show: true,
          message: `Actor ${action}d successfully`,
          type: "success",
        });
      } catch (err) {
        console.error(`Error ${action}ing actor:`, err);
        setNotification({
          show: true,
          message: `Failed to ${action} actor: ${err.message}`,
          type: "error",
        });
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingActor) {
        const { error } = await supabase
          .from("Actors")
          .update({
            name: values.name,
            bio: values.bio || null,
            isDisabled: values.isDisabled || false,
          })
          .eq("id", editingActor.id);

        if (error) throw error;

        setActors(
          actors.map((a) =>
            a.id === editingActor.id
              ? {
                  ...a,
                  name: values.name,
                  bio: values.bio || null,
                  isDisabled: values.isDisabled || false,
                }
              : a
          )
        );

        setNotification({
          show: true,
          message: "Actor updated successfully",
          type: "success",
        });
      } else {
        const { data, error } = await supabase
          .from("Actors")
          .insert({
            name: values.name,
            bio: values.bio || null,
            isDisabled: false,
          })
          .select();

        if (error) throw error;

        setActors([...actors, { ...data[0], movieCount: 0 }]);

        setNotification({
          show: true,
          message: "Actor created successfully",
          type: "success",
        });
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving actor:", err);
      setNotification({
        show: true,
        message: `Failed to save actor: ${err.message}`,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading actors...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="actor-list-section">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="list-header">
        <h2>Actor Management</h2>
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by Name..."
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

      {showForm && (
        <ActorForm
          actor={editingActor}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isSubmitting={false}
        />
      )}

      <div className="table-container">
        <table className="actors-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Movies</th>
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
                  <td>{actor.name}</td>
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
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(actor)}
                      className={
                        actor.isDisabled ? "enable-btn" : "disable-btn"
                      }
                    >
                      {actor.isDisabled ? "Enable" : "Disable"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data-row">
                  {actors.length > 0
                    ? "No actors found matching your criteria"
                    : "No actors found. Add your first actor!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
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
