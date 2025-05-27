import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import supabase from "../../../../../supabase-client";
import "./MovieForm.scss";

const currentYear = new Date().getFullYear();
const maxYear = currentYear + 5;

const MovieSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, "Title must be at least 2 characters")
    .max(100, "Title must be less than 100 characters")
    .required("Title is required"),
  year: Yup.number()
    .integer("Year must be a whole number")
    .min(1900, "Year must be 1900 or later")
    .max(maxYear, `Year must be ${maxYear} or earlier`)
    .required("Year is required"),
  description: Yup.string().max(
    2000,
    "Description must be less than 2000 characters"
  ),
  imdb_rating: Yup.number()
    .min(0, "Rating must be at least 0")
    .max(10, "Rating must be at most 10")
    .required("Rating is required"),
  type: Yup.string().required("Content type is required"),
  runtime: Yup.string().max(50, "Runtime must be less than 50 characters"),
  country: Yup.string().max(100, "Country must be less than 100 characters"),
  language: Yup.string().max(100, "Language must be less than 100 characters"),
  poster_url: Yup.string().url("Must be a valid URL").nullable(),
  banner_url: Yup.string().url("Must be a valid URL").nullable(),
  trailer_url: Yup.string().url("Must be a valid URL").nullable(),
  isDisabled: Yup.boolean(),
  selectedGenres: Yup.array().min(1, "Select at least one genre"),
  selectedDirectors: Yup.array(),
  selectedActors: Yup.array(),
});

const MovieForm = ({ movie, onSubmit, onCancel, isSubmitting }) => {
  const isEditMode = !!movie;
  const [genres, setGenres] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [actors, setActors] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(true);
  const [formInitialized, setFormInitialized] = useState(false);

  const [searchTerm, setSearchTerm] = useState({
    directors: "",
    actors: "",
  });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [selectedActors, setSelectedActors] = useState([]);

  useEffect(() => {
    const fetchRelatedData = async () => {
      setLoadingRelations(true);
      try {
        const [genresResponse, directorsResponse, actorsResponse] =
          await Promise.all([
            supabase.from("Genres").select("id, name").order("name"),
            supabase.from("Directors").select("id, name").order("name"),
            supabase.from("Actors").select("id, name").order("name"),
          ]);

        if (genresResponse.error) throw genresResponse.error;
        if (directorsResponse.error) throw directorsResponse.error;
        if (actorsResponse.error) throw actorsResponse.error;

        setGenres(genresResponse.data || []);
        setDirectors(directorsResponse.data || []);
        setActors(actorsResponse.data || []);
      } catch (err) {
        console.error("Error fetching related data:", err);
      } finally {
        setLoadingRelations(false);
      }
    };

    fetchRelatedData();
  }, []);

  useEffect(() => {
    const loadMovieRelations = async () => {
      if (isEditMode && movie?.id) {
        try {
          const [genresData, directorsData, actorsData] = await Promise.all([
            supabase
              .from("MovieGenres")
              .select("genre_id")
              .eq("movie_id", movie.id),
            supabase
              .from("MovieDirectors")
              .select("director_id")
              .eq("movie_id", movie.id),
            supabase
              .from("MovieActors")
              .select("actor_id")
              .eq("movie_id", movie.id),
          ]);

          if (genresData.error) throw genresData.error;
          if (directorsData.error) throw directorsData.error;
          if (actorsData.error) throw actorsData.error;

          const genreIds = genresData.data.map((item) => item.genre_id);
          const directorIds = directorsData.data.map(
            (item) => item.director_id
          );
          const actorIds = actorsData.data.map((item) => item.actor_id);

          setSelectedGenres(genreIds);
          setSelectedDirectors(directorIds);
          setSelectedActors(actorIds);

          console.log("Loaded relationships:", {
            genres: genreIds,
            directors: directorIds,
            actors: actorIds,
          });
        } catch (err) {
          console.error("Error loading movie relationships:", err);
        }
      }
      setFormInitialized(true);
    };

    loadMovieRelations();
  }, [isEditMode, movie]);

  const initialValues = {
    title: movie?.title || "",
    year: movie?.year || currentYear,
    description: movie?.description || "",
    imdb_rating: movie?.imdb_rating || 0,
    type: movie?.type || "Movie",
    runtime: movie?.runtime || "",
    country: movie?.country || "",
    language: movie?.language || "",
    poster_url: movie?.poster_url || "",
    banner_url: movie?.banner_url || "",
    trailer_url: movie?.trailer_url || "",
    isDisabled: movie?.isDisabled || false,
    selectedGenres: selectedGenres,
    selectedDirectors: selectedDirectors,
    selectedActors: selectedActors,
  };

  const handleFormSubmit = async (values, formikBag) => {
    const uniqueGenreIds = [...new Set(values.selectedGenres || [])];
    const uniqueDirectorIds = [...new Set(values.selectedDirectors || [])];
    const uniqueActorIds = [...new Set(values.selectedActors || [])];

    const formData = {
      ...values,
      genreIds: uniqueGenreIds,
      directorIds: uniqueDirectorIds,
      actorIds: uniqueActorIds,
    };

    await onSubmit(formData, formikBag);
  };

  const filteredDirectors = directors.filter((director) =>
    director.name.toLowerCase().includes(searchTerm.directors.toLowerCase())
  );

  const filteredActors = actors.filter((actor) =>
    actor.name.toLowerCase().includes(searchTerm.actors.toLowerCase())
  );

  if (loadingRelations || !formInitialized) {
    return <div className="loading">Loading form data...</div>;
  }

  return (
    <div className="movie-form-container">
      <h3>{isEditMode ? "Edit Movie" : "Add New Movie"}</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={MovieSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize={true}
      >
        {({ errors, touched, values, setFieldValue }) => (
          <Form className="movie-form">
            <div className="form-columns">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="title">Movie Title</label>
                  <Field
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter movie title"
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
                    min="1900"
                    max={maxYear}
                  />
                  <ErrorMessage
                    name="year"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="type">Content Type</label>
                  <Field as="select" id="type" name="type">
                    <option value="Movie">Movie</option>
                    <option value="TV-Series">TV Series</option>
                    <option value="Documentary">Documentary</option>
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
                    min="0"
                    max="10"
                    step="0.1"
                  />
                  <ErrorMessage
                    name="imdb_rating"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="runtime">Runtime</label>
                  <Field
                    id="runtime"
                    name="runtime"
                    type="text"
                    placeholder="e.g., 120 min (for movies) or 3 seasons (for shows)"
                  />
                  <ErrorMessage
                    name="runtime"
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
                    placeholder="e.g., USA, UK, etc."
                  />
                  <ErrorMessage
                    name="country"
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
                    placeholder="e.g., English, French, etc."
                  />
                  <ErrorMessage
                    name="language"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="poster_url">Poster URL</label>
                  <Field
                    id="poster_url"
                    name="poster_url"
                    type="text"
                    placeholder="https://example.com/poster.jpg"
                  />
                  <ErrorMessage
                    name="poster_url"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="banner_url">Banner URL</label>
                  <Field
                    id="banner_url"
                    name="banner_url"
                    type="text"
                    placeholder="https://example.com/banner.jpg"
                  />
                  <ErrorMessage
                    name="banner_url"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="trailer_url">Trailer URL</label>
                  <Field
                    id="trailer_url"
                    name="trailer_url"
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <ErrorMessage
                    name="trailer_url"
                    component="div"
                    className="error-message"
                  />
                </div>

                <div className="form-group">
                  <label>Genres</label>
                  <div className="checkbox-group">
                    {genres.map((genre) => (
                      <div key={genre.id} className="checkbox-item">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="selectedGenres"
                            value={genre.id}
                            checked={values.selectedGenres.includes(genre.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const genreId = genre.id;

                              if (isChecked) {
                                setFieldValue("selectedGenres", [
                                  ...values.selectedGenres,
                                  genreId,
                                ]);
                              } else {
                                setFieldValue(
                                  "selectedGenres",
                                  values.selectedGenres.filter(
                                    (id) => id !== genreId
                                  )
                                );
                              }
                            }}
                          />
                          <span className="label-text">{genre.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  <ErrorMessage
                    name="selectedGenres"
                    component="div"
                    className="error-message"
                  />
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <Field
                id="description"
                name="description"
                as="textarea"
                rows="4"
                placeholder="Enter movie description"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-columns relationship-columns">
              <div className="form-column">
                <div className="form-group">
                  <label>Directors</label>
                  <input
                    type="text"
                    placeholder="Search directors..."
                    value={searchTerm.directors}
                    onChange={(e) =>
                      setSearchTerm({
                        ...searchTerm,
                        directors: e.target.value,
                      })
                    }
                    className="search-input"
                  />
                  <div className="checkbox-group with-search">
                    {filteredDirectors.map((director) => (
                      <div key={director.id} className="checkbox-item">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="selectedDirectors"
                            value={director.id}
                            checked={values.selectedDirectors.includes(
                              director.id
                            )}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const directorId = director.id;

                              if (isChecked) {
                                setFieldValue("selectedDirectors", [
                                  ...values.selectedDirectors,
                                  directorId,
                                ]);
                              } else {
                                setFieldValue(
                                  "selectedDirectors",
                                  values.selectedDirectors.filter(
                                    (id) => id !== directorId
                                  )
                                );
                              }
                            }}
                          />
                          <span className="label-text">{director.name}</span>
                        </label>
                      </div>
                    ))}
                    {filteredDirectors.length === 0 && (
                      <div className="no-results">No directors found</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-column">
                <div className="form-group">
                  <label>Actors</label>
                  <input
                    type="text"
                    placeholder="Search actors..."
                    value={searchTerm.actors}
                    onChange={(e) =>
                      setSearchTerm({ ...searchTerm, actors: e.target.value })
                    }
                    className="search-input"
                  />
                  <div className="checkbox-group with-search">
                    {filteredActors.map((actor) => (
                      <div key={actor.id} className="checkbox-item">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            name="selectedActors"
                            value={actor.id}
                            checked={values.selectedActors.includes(actor.id)}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              const actorId = actor.id;

                              if (isChecked) {
                                setFieldValue("selectedActors", [
                                  ...values.selectedActors,
                                  actorId,
                                ]);
                              } else {
                                setFieldValue(
                                  "selectedActors",
                                  values.selectedActors.filter(
                                    (id) => id !== actorId
                                  )
                                );
                              }
                            }}
                          />
                          <span className="label-text">{actor.name}</span>
                        </label>
                      </div>
                    ))}
                    {filteredActors.length === 0 && (
                      <div className="no-results">No actors found</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {isEditMode && (
              <div className="form-group status-toggle">
                <label className="checkbox-label">
                  <Field type="checkbox" name="isDisabled" />
                  <span className="label-text">Disable this movie</span>
                </label>
                <small>Disabled movies won't appear in user searches</small>
              </div>
            )}

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
