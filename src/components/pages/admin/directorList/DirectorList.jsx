import { useState, useEffect, useMemo } from "react";
import supabase from "../../../../supabase-client";
import DirectorForm from "./directorForm/DirectorForm";
import "../ListStyle.scss";

const DirectorList = () => {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDirector, setEditingDirector] = useState(null);
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
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const ITEMS_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDirectors();
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

  const fetchDirectors = async () => {
    setLoading(true);
    try {
      const { data: directorsData, error: directorsError } = await supabase
        .from("Directors")
        .select("*")
        .order("name");

      if (directorsError) throw directorsError;
      const { data: movieCountsData, error: movieCountsError } =
        await supabase.rpc("get_directors_with_movie_count");
      if (movieCountsError) throw movieCountsError;
      const movieCountMap = {};
      if (movieCountsData) {
        movieCountsData.forEach((item) => {
          movieCountMap[item.director_id] = item.movie_count;
        });
      }
      const directorsWithCounts = directorsData.map((director) => ({
        ...director,
        movieCount: movieCountMap[director.id] || 0,
      }));

      setDirectors(directorsWithCounts);
    } catch (err) {
      console.error("Error fetching directors:", err);
      setError("Failed to load directors");
    } finally {
      setLoading(false);
    }
  };

  const filteredDirectors = useMemo(() => {
    let result = [...directors];
    if (searchQuery) {
      const searchedText = searchQuery.toLowerCase();
      result = result.filter((director) =>
        director.name?.toLowerCase().includes(searchedText)
      );
    }
    if (filters.status) {
      if (filters.status === "active") {
        result = result.filter((director) => !director.isDisabled);
      } else if (filters.status === "disabled") {
        result = result.filter((director) => director.isDisabled);
      }
    }
    if (filters.moviesMin) {
      const minCount = parseInt(filters.moviesMin);
      result = result.filter((director) => director.movieCount >= minCount);
    }
    if (filters.moviesMax) {
      const maxCount = parseInt(filters.moviesMax);
      result = result.filter((director) => director.movieCount <= maxCount);
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        if (sortConfig.key === "movieCount") {
          const aRating = parseFloat(a.movieCount) || 0;
          const bRating = parseFloat(b.movieCount) || 0;
          return sortConfig.direction === "asc"
            ? aRating - bRating
            : bRating - aRating;
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
  }, [directors, searchQuery, sortConfig, filters]);
  const paginatedDirectors = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDirectors.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDirectors, currentPage]);

  const pageCount = Math.ceil(filteredDirectors.length / ITEMS_PER_PAGE);

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

  const refreshDirectors = async () => {
    setLoading(true);
    await fetchDirectors();
    setNotification({
      show: true,
      message: "Directors list refreshed",
      type: "success",
    });
  };

  const handleAddDirector = () => {
    setEditingDirector(null);
    setShowForm(true);
  };

  const handleEditDirector = (director) => {
    setEditingDirector(director);
    setShowForm(true);
  };

  const handleToggleStatus = async (director) => {
    const action = director.isDisabled ? "enable" : "disable";

    if (window.confirm(`Are you sure you want to ${action} this director?`)) {
      try {
        const { error } = await supabase
          .from("Directors")
          .update({ isDisabled: !director.isDisabled })
          .eq("id", director.id);

        if (error) throw error;

        setDirectors(
          directors.map((d) =>
            d.id === director.id
              ? { ...d, isDisabled: !director.isDisabled }
              : d
          )
        );

        setNotification({
          show: true,
          message: `Director ${action}d successfully`,
          type: "success",
        });
      } catch (err) {
        console.error(`Error ${action}ing director:`, err);
        setNotification({
          show: true,
          message: `Failed to ${action} director: ${err.message}`,
          type: "error",
        });
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingDirector) {
        const { error } = await supabase
          .from("Directors")
          .update({
            name: values.name,
            biography: values.biography || null,
            nationality: values.nationality || null,
            image_url: values.imageUrl || null,
            isDisabled: values.isDisabled || false,
          })
          .eq("id", editingDirector.id);

        if (error) throw error;

        setDirectors(
          directors.map((d) =>
            d.id === editingDirector.id
              ? {
                  ...d,
                  name: values.name,
                  biography: values.biography || null,
                  nationality: values.nationality || null,
                  image_url: values.imageUrl || null,
                  isDisabled: values.isDisabled || false,
                }
              : d
          )
        );

        setNotification({
          show: true,
          message: "Director updated successfully",
          type: "success",
        });
      } else {
        const { data, error } = await supabase
          .from("Directors")
          .insert({
            name: values.name,
            biography: values.biography || null,
            nationality: values.nationality || null,
            image_url: values.imageUrl || null,
            isDisabled: false,
          })
          .select();

        if (error) throw error;

        setDirectors([...directors, { ...data[0], movieCount: 0 }]);

        setNotification({
          show: true,
          message: "Director created successfully",
          type: "success",
        });
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving director:", err);
      setNotification({
        show: true,
        message: `Failed to save director: ${err.message}`,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading directors...</div>;
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
          <h2>Director Management</h2>
          <button onClick={refreshDirectors} className="refresh-btn">
            ↻
          </button>
        </div>
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
          <button onClick={handleAddDirector} className="add-btn">
            Add New Director
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
        <DirectorForm
          director={editingDirector}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isSubmitting={false}
        />
      )}

      <div className="table-container">
        <table className="table-data">
          <thead>
            <tr>
              <th onClick={() => requestSort("name")} className="sortable">
                Name{getSortIndicator("name")}
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
            {paginatedDirectors.length > 0 ? (
              paginatedDirectors.map((director) => (
                <tr
                  key={director.id}
                  className={director.isDisabled ? "disabled-row" : ""}
                >
                  <td>{director.name}</td>
                  <td>
                    <span
                      className={`status-badge ${director.isDisabled ? "disabled" : "active"
                        }`}
                    >
                      {director.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td>{director.movieCount || 0} movie(s)</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEditDirector(director)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(director)}
                      className={
                        director.isDisabled ? "enable-btn" : "disable-btn"
                      }
                    >
                      {director.isDisabled ? "Enable" : "Disable"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data-row">
                  {directors.length > 0
                    ? "No directors found matching your criteria"
                    : "No directors found. Add your first director!"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredDirectors.length > ITEMS_PER_PAGE && (
        <div className="table-footer">
          <div className="results-count">
            Showing {paginatedDirectors.length} of {filteredDirectors.length}{" "}
            directors
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

export default DirectorList;
