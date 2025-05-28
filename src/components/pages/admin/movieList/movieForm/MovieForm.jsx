import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import supabase from "../../../../../supabase-client";
import "./MovieForm.scss";

const MovieSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters")
    .required("Title is required"),
  description: Yup.string().max(
    2000,
    "Description must be less than 2000 characters"
  ),
  year: Yup.number()
    .min(1900, "Year must be 1900 or later")
    .max(
      new Date().getFullYear() + 5,
      `Year cannot be more than ${new Date().getFullYear() + 5}`
    )
    .required("Year is required"),
  country: Yup.string().max(50, "Country must be less than 50 characters"),
  language: Yup.string().max(50, "Language must be less than 50 characters"),
  imdb_rating: Yup.number()
    .min(0, "Rating cannot be negative")
    .max(10, "Rating cannot exceed 10")
    .typeError("Rating must be a number"),
  runtime: Yup.number()
    .min(1, "Runtime must be positive")
    .typeError("Runtime must be a number"),
  posterUrl: Yup.string().url("Must be a valid URL"),
  bannerUrl: Yup.string().url("Must be a valid URL"),
  trailerUrl: Yup.string().url("Must be a valid URL"),
  type: Yup.string().required("Movie type is required"),
  isDisabled: Yup.boolean(),
  genreIds: Yup.array().min(1, "Select at least one genre"),
  directorIds: Yup.array().min(1, "Select at least one director"),
});

const MovieForm = ({ movie, onSubmit, onCancel, isSubmitting }) => {
  const [genres, setGenres] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActors, setSelectedActors] = useState([]);
  const [genreSearch, setGenreSearch] = useState("");
  const [directorSearch, setDirectorSearch] = useState("");
  const [actorSearch, setActorSearch] = useState("");

  const isEditMode = !!movie;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: genresData, error: genresError } = await supabase
          .from("Genres")
          .select("*")
          .order("name");

        if (genresError) throw genresError;
        setGenres(genresData || []);

        const { data: directorsData, error: directorsError } = await supabase
          .from("Directors")
          .select("*")
          .order("name");

        if (directorsError) throw directorsError;
        setDirectors(directorsData || []);

        const { data: actorsData, error: actorsError } = await supabase
          .from("Actors")
          .select("*")
          .order("name");

        if (actorsError) throw actorsError;
        setActors(actorsData || []);

        if (isEditMode) {
          const { data: movieActors, error: actorsError } = await supabase
            .from("MovieActors")
            .select("actor_id, character_name")
            .eq("movie_id", movie.id);

          if (!actorsError && movieActors) {
            setSelectedActors(
              movieActors.map((ma) => ({
                actorId: ma.actor_id,
                characterName: ma.character_name || "",
              }))
            );
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEditMode, movie?.id]);

  const getInitialValues = () => {
    if (isEditMode) {
      const genreIds =
        movie.MovieGenres?.map((mg) => mg.genre_id || mg.Genres?.id) || [];
      const directorIds =
        movie.MovieDirectors?.map((md) => md.director_id || md.Directors?.id) ||
        [];

      return {
        title: movie.title || "",
        description: movie.description || "",
        year: movie.year || new Date().getFullYear(),
        country: movie.country || "",
        language: movie.language || "",
        imdb_rating: movie.imdb_rating || "",
        runtime: movie.runtime || "",
        posterUrl: movie.poster_url || "",
        bannerUrl: movie.banner_url || "",
        trailerUrl: movie.trailer_url || "",
        type: movie.type || "Movie",
        isDisabled: movie.isDisabled || false,
        genreIds: genreIds,
        directorIds: directorIds,
      };
    }

    return {
      title: "",
      description: "",
      year: new Date().getFullYear(),
      country: "",
      language: "",
      imdb_rating: "",
      runtime: "",
      posterUrl: "",
      bannerUrl: "",
      trailerUrl: "",
      type: "Movie",
      isDisabled: false,
      genreIds: [],
      directorIds: [],
    };
  };

  const handleSubmit = async (values) => {
    const actorData = selectedActors.map((actor) => ({
      actorId: actor.actorId,
      characterName: actor.characterName,
    }));
    await onSubmit({ ...values, actors: actorData });
  };

  const addActor = (actorId) => {
    if (!selectedActors.some((actor) => actor.actorId === actorId)) {
      setSelectedActors([...selectedActors, { actorId, characterName: "" }]);
    }
  };

  const removeActor = (actorId) => {
    setSelectedActors(
      selectedActors.filter((actor) => actor.actorId !== actorId)
    );
  };

  const updateCharacterName = (actorId, characterName) => {
    setSelectedActors(
      selectedActors.map((actor) =>
        actor.actorId === actorId ? { ...actor, characterName } : actor
      )
    );
  };

  const getActorName = (actorId) => {
    const actor = actors.find((a) => a.id === actorId);
    return actor ? actor.name : "Unknown Actor";
  };

  const filteredGenres = genres.filter((genre) =>
    genre.name.toLowerCase().includes(genreSearch.toLowerCase())
  );

  const filteredDirectors = directors.filter((director) =>
    director.name.toLowerCase().includes(directorSearch.toLowerCase())
  );

  const filteredActors = actors.filter(
    (actor) =>
      actor.name.toLowerCase().includes(actorSearch.toLowerCase()) &&
      !selectedActors.some((selected) => selected.actorId === actor.id)
  );

  if (loading) return <div className="loading">Loading form data...</div>;

  return (
    <div className="movie-form-container">
      <h3>{isEditMode ? "Edit Movie" : "Add New Movie"}</h3>
      <Formik
        initialValues={getInitialValues()}
        validationSchema={MovieSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form className="movie-form">
            <div className="form-columns">
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <Field
                  id="title"
                  name="title"
                  type="text"
                  placeholder="Enter movie title"
                  className={errors.title && touched.title ? "error" : ""}
                  autoFocus
                />
                <ErrorMessage
                  name="title"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Release Year</label>
                <Field
                  id="year"
                  name="year"
                  type="number"
                  placeholder="Enter release year"
                  className={errors.year && touched.year ? "error" : ""}
                />
                <ErrorMessage
                  name="year"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Type</label>
                <Field
                  as="select"
                  id="type"
                  name="type"
                  className={errors.type && touched.type ? "error" : ""}
                >
                  <option value="Movie">Movie</option>
                  <option value="TV Series">TV Series</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Animation">Animation</option>
                </Field>
                <ErrorMessage
                  name="type"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="imdb_rating">IMDb Rating</label>
                <Field
                  id="imdb_rating"
                  name="imdb_rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  placeholder="Enter IMDb rating"
                  className={
                    errors.imdb_rating && touched.imdb_rating ? "error" : ""
                  }
                />
                <ErrorMessage
                  name="imdb_rating"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="runtime">Runtime (minutes)</label>
                <Field
                  id="runtime"
                  name="runtime"
                  type="number"
                  min="1"
                  placeholder="Enter runtime in minutes"
                  className={errors.runtime && touched.runtime ? "error" : ""}
                />
                <ErrorMessage
                  name="runtime"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="language">Language</label>
                <Field
                  id="language"
                  name="language"
                  type="text"
                  placeholder="Enter language"
                  className={errors.language && touched.language ? "error" : ""}
                />
                <ErrorMessage
                  name="language"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="country">Country</label>
                <Field
                  id="country"
                  name="country"
                  type="text"
                  placeholder="Enter country"
                  className={errors.country && touched.country ? "error" : ""}
                />
                <ErrorMessage
                  name="country"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="posterUrl">Poster URL</label>
                <Field
                  id="posterUrl"
                  name="posterUrl"
                  type="url"
                  placeholder="Enter poster URL"
                  className={
                    errors.posterUrl && touched.posterUrl ? "error" : ""
                  }
                />
                <ErrorMessage
                  name="posterUrl"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bannerUrl">Banner URL</label>
                <Field
                  id="bannerUrl"
                  name="bannerUrl"
                  type="url"
                  placeholder="Enter banner URL"
                  className={
                    errors.bannerUrl && touched.bannerUrl ? "error" : ""
                  }
                />
                <ErrorMessage
                  name="bannerUrl"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="trailerUrl">Trailer URL</label>
                <Field
                  id="trailerUrl"
                  name="trailerUrl"
                  type="url"
                  placeholder="Enter trailer URL"
                  className={
                    errors.trailerUrl && touched.trailerUrl ? "error" : ""
                  }
                />
                <ErrorMessage
                  name="trailerUrl"
                  component="div"
                  className="error-message"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <Field
                as="textarea"
                id="description"
                name="description"
                rows="4"
                placeholder="Enter movie description"
                className={
                  errors.description && touched.description ? "error" : ""
                }
              />
              <ErrorMessage
                name="description"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-columns relationship-columns">
              <div className="form-group">
                <label>Genres</label>
                <input
                  type="text"
                  placeholder="Search genres..."
                  className="search-input"
                  value={genreSearch}
                  onChange={(e) => setGenreSearch(e.target.value)}
                />
                <div
                  className={`checkbox-group with-search ${errors.genreIds && touched.genreIds ? "error" : ""}`}
                >
                  {filteredGenres.length > 0 ? (
                    filteredGenres.map((genre) => (
                      <div key={genre.id} className="checkbox-item">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={values.genreIds.includes(genre.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const newGenreIds = isChecked
                                ? [...values.genreIds, genre.id]
                                : values.genreIds.filter(
                                    (id) => id !== genre.id
                                  );
                              setFieldValue("genreIds", newGenreIds);
                            }}
                          />
                          {genre.name} {genre.isDisabled && "(disabled)"}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No matching genres found</div>
                  )}
                </div>
                <ErrorMessage
                  name="genreIds"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label>Directors</label>
                <input
                  type="text"
                  placeholder="Search directors..."
                  className="search-input"
                  value={directorSearch}
                  onChange={(e) => setDirectorSearch(e.target.value)}
                />
                <div
                  className={`checkbox-group with-search ${errors.directorIds && touched.directorIds ? "error" : ""}`}
                >
                  {filteredDirectors.length > 0 ? (
                    filteredDirectors.map((director) => (
                      <div key={director.id} className="checkbox-item">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={values.directorIds.includes(director.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const newDirectorIds = isChecked
                                ? [...values.directorIds, director.id]
                                : values.directorIds.filter(
                                    (id) => id !== director.id
                                  );
                              setFieldValue("directorIds", newDirectorIds);
                            }}
                          />
                          {director.name} {director.isDisabled && "(disabled)"}
                        </label>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">
                      No matching directors found
                    </div>
                  )}
                </div>
                <ErrorMessage
                  name="directorIds"
                  component="div"
                  className="error-message"
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Actors</label>
              <div className="actor-selection">
                <input
                  type="text"
                  placeholder="Search actors..."
                  className="search-input"
                  value={actorSearch}
                  onChange={(e) => setActorSearch(e.target.value)}
                />
                <div className="checkbox-group with-search">
                  {filteredActors.length > 0 ? (
                    filteredActors.map((actor) => (
                      <div key={actor.id} className="checkbox-item">
                        <button
                          type="button"
                          className="add-actor-btn"
                          onClick={() => addActor(actor.id)}
                        >
                          + {actor.name} {actor.isDisabled && "(disabled)"}
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-results">No matching actors found</div>
                  )}
                </div>
              </div>

              {selectedActors.length > 0 && (
                <div className="selected-actors">
                  <h4>Selected Actors</h4>
                  {selectedActors.map((actor) => (
                    <div key={actor.actorId} className="selected-actor-item">
                      <div className="actor-name">
                        {getActorName(actor.actorId)}
                      </div>
                      <input
                        type="text"
                        placeholder="Character name"
                        value={actor.characterName}
                        onChange={(e) =>
                          updateCharacterName(actor.actorId, e.target.value)
                        }
                      />
                      <button
                        type="button"
                        className="remove-actor-btn"
                        onClick={() => removeActor(actor.actorId)}
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group status-toggle">
              <label className="checkbox-label">
                <Field type="checkbox" name="isDisabled" />
                <span className="label-text">Disable this movie</span>
              </label>
              <small>Disabled movies won't appear in user searches</small>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
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
                  : isEditMode
                    ? "Update Movie"
                    : "Add Movie"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default MovieForm;
