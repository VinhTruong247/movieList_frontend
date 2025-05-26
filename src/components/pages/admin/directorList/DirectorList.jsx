import { useState, useEffect } from "react";
import supabase from "../../../../supabase-client";
import DirectorForm from "./directorForm/DirectorForm";
import "./DirectorList.scss";

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
            bio: values.bio || null,
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
                  bio: values.bio || null,
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
            bio: values.bio || null,
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
    <div className="director-list-section">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="list-header">
        <h2>Director Management</h2>
        <button onClick={handleAddDirector} className="add-btn">
          Add New Director
        </button>
      </div>

      {showForm && (
        <DirectorForm
          director={editingDirector}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isSubmitting={false}
        />
      )}

      <div className="table-container">
        <table className="directors-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Movies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {directors.length > 0 ? (
              directors.map((director) => (
                <tr
                  key={director.id}
                  className={director.isDisabled ? "disabled-row" : ""}
                >
                  <td>{director.name}</td>
                  <td>
                    <span
                      className={`status-badge ${
                        director.isDisabled ? "disabled" : "active"
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
                  No directors found. Add your first director!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DirectorList;
