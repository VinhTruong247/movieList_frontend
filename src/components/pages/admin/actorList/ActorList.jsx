import { useState, useEffect } from "react";
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
        <button onClick={handleAddActor} className="add-btn">
          Add New Actor
        </button>
      </div>

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
            {actors.length > 0 ? (
              actors.map((actor) => (
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
                  No actors found. Add your first actor!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActorList;
