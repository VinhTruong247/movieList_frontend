import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import supabase from "../../../../supabase-client";
import "./GenreList.scss";

const GenreSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Genre name must be at least 3 characters")
    .max(30, "Genre name must be less than 30 characters")
    .required("Genre name is required"),
  isDisabled: Yup.boolean(),
});

const GenreList = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const fetchGenres = async () => {
    setLoading(true);
    try {
      const { data: genresData, error: genresError } = await supabase
        .from("Genres")
        .select("*")
        .order("name");

      if (genresError) throw genresError;
      const { data: movieCountsData, error: movieCountsError } =
        await supabase.rpc("get_genres_with_movie_count");

      if (movieCountsError) throw movieCountsError;
      const movieCountMap = {};

      if (movieCountsData) {
        movieCountsData.forEach((item) => {
          movieCountMap[item.genre_id] = item.movie_count;
        });
      }
      const genresWithCounts = genresData.map((genre) => ({
        ...genre,
        movieCount: movieCountMap[genre.id] || 0,
      }));

      setGenres(genresWithCounts);
    } catch (err) {
      console.error("Error fetching genres:", err);
      setError("Failed to load genres");
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = () => {
    setEditingGenre(null);
    setShowForm(true);
  };

  const handleEditGenre = (genre) => {
    setEditingGenre(genre);
    setShowForm(true);
  };

  const handleToggleStatus = async (genre) => {
    const action = genre.isDisabled ? "enable" : "disable";

    if (window.confirm(`Are you sure you want to ${action} this genre?`)) {
      try {
        const { error } = await supabase
          .from("Genres")
          .update({ isDisabled: !genre.isDisabled })
          .eq("id", genre.id);

        if (error) throw error;

        setGenres(
          genres.map((g) =>
            g.id === genre.id ? { ...g, isDisabled: !genre.isDisabled } : g
          )
        );

        setNotification({
          show: true,
          message: `Genre ${action}d successfully`,
          type: "success",
        });
      } catch (err) {
        console.error(`Error ${action}ing genre:`, err);
        setNotification({
          show: true,
          message: `Failed to ${action} genre: ${err.message}`,
          type: "error",
        });
      }
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (editingGenre) {
        const { error } = await supabase
          .from("Genres")
          .update({
            name: values.name,
            isDisabled: values.isDisabled || false,
          })
          .eq("id", editingGenre.id);

        if (error) throw error;

        setGenres(
          genres.map((g) =>
            g.id === editingGenre.id
              ? {
                  ...g,
                  name: values.name,
                  isDisabled: values.isDisabled || false,
                }
              : g
          )
        );

        setNotification({
          show: true,
          message: "Genre updated successfully",
          type: "success",
        });
      } else {
        const { data, error } = await supabase
          .from("Genres")
          .insert({
            name: values.name,
            isDisabled: false,
          })
          .select();

        if (error) throw error;

        setGenres([...genres, { ...data[0], movieCount: 0 }]);

        setNotification({
          show: true,
          message: "Genre created successfully",
          type: "success",
        });
      }

      resetForm();
      setShowForm(false);
    } catch (err) {
      console.error("Error saving genre:", err);
      setNotification({
        show: true,
        message: `Failed to save genre: ${err.message}`,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Loading genres...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="genre-list-section">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="list-header">
        <h2>Genre Management</h2>
        <button onClick={handleAddGenre} className="add-btn">
          Add New Genre
        </button>
      </div>

      {showForm && (
        <div className="genre-form-container">
          <h3>{editingGenre ? "Edit Genre" : "Add New Genre"}</h3>
          <Formik
            initialValues={{
              name: editingGenre?.name || "",
              isDisabled: editingGenre?.isDisabled || false,
            }}
            validationSchema={GenreSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, values }) => (
              <Form className="genre-form">
                <div className="form-group">
                  <label htmlFor="name">Genre Name</label>
                  <Field
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter genre name"
                  />
                  {errors.name && touched.name && (
                    <div className="error">{errors.name}</div>
                  )}
                </div>

                {editingGenre && (
                  <div className="form-group status-toggle">
                    <label>
                      <Field type="checkbox" name="isDisabled" />
                      Disable this genre
                    </label>
                    <small>Disabled genres won't appear in user searches</small>
                  </div>
                )}

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="cancel-btn"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : editingGenre
                        ? "Update Genre"
                        : "Add Genre"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}

      <div className="table-container">
        <table className="genres-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Movies</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {genres.length > 0 ? (
              genres.map((genre) => (
                <tr
                  key={genre.id}
                  className={genre.isDisabled ? "disabled-row" : ""}
                >
                  <td>{genre.name}</td>
                  <td>
                    <span
                      className={`status-badge ${genre.isDisabled ? "disabled" : "active"}`}
                    >
                      {genre.isDisabled ? "Disabled" : "Active"}
                    </span>
                  </td>
                  <td>{genre.movieCount || 0} movie(s)</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleEditGenre(genre)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(genre)}
                      className={
                        genre.isDisabled ? "enable-btn" : "disable-btn"
                      }
                    >
                      {genre.isDisabled ? "Enable" : "Disable"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data-row">
                  No genres found. Add your first genre!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GenreList;
