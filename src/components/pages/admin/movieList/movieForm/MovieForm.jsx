import { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import supabase from "../../../../../supabase-client";
import { getAllGenres } from "../../../../../utils/GenresAPI";
import "./MovieForm.scss";

const MovieSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  type: Yup.string().required("Type is required"),
  year: Yup.string()
    .required("Year is required")
    .matches(/^\d+$/, "Year must contain only digits")
    .test(
      "valid-year",
      "Year must be between 1888 and current year + 10",
      (value) => {
        if (!value) return true;
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return year >= 1888 && year <= currentYear + 10;
      }
    ),
  genre: Yup.array().min(1, "At least one genre is required"),
  director: Yup.string().required("Director is required"),
  imdb_rating: Yup.number().min(0).max(10).required("Rating is required"),
  description: Yup.string().required("Description is required"),
  runtime: Yup.number()
    .typeError("Runtime must be a number")
    .positive("Runtime must be positive")
    .required("Runtime is required"),
  language: Yup.string().required("Language is required"),
  country: Yup.string().required("Country is required"),
  poster_url: Yup.string().required("Poster URL is required"),
  banner_url: Yup.string().required("Banner URL is required"),
  trailer_url: Yup.string().required("Trailer URL is required"),
});

const MovieForm = ({ movie, onSubmit, onClose }) => {
  const [genres, setGenres] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormData = async () => {
      setLoading(true);
      try {
        const genresData = await getAllGenres();
        setGenres(genresData || []);
        const { data: directorsData, error: directorsError } = await supabase
          .from("Directors")
          .select("*")
          .order("name");
        if (directorsError) throw directorsError;
        setDirectors(directorsData || []);
      } catch (err) {
        console.error("Error fetching form data:", err);
        setError("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, []);
  const extractGenres = (movieData) => {
    if (!movieData?.MovieGenres || !Array.isArray(movieData.MovieGenres)) {
      return [];
    }

    return movieData.MovieGenres.filter((mg) => mg.genre_id).map(
      (mg) => mg.genre_id
    );
  };
  const extractDirector = (movieData) => {
    if (
      !movieData?.MovieDirectors ||
      !Array.isArray(movieData.MovieDirectors) ||
      !movieData.MovieDirectors.length
    ) {
      return "";
    }

    return movieData.MovieDirectors[0]?.director_id || "";
  };

  const extractRuntimeValue = (runtime) => {
    if (!runtime) return "";
    if (typeof runtime === "string") {
      return parseInt(runtime.replace(/[^0-9]/g, ""), 10) || "";
    }
    return runtime;
  };

  const initialValues = movie
    ? {
        id: movie.id,
        title: movie.title || "",
        type: movie.type || "",
        year: movie.year
          ? movie.year.toString()
          : new Date().getFullYear().toString(),
        genre: extractGenres(movie),
        director: extractDirector(movie),
        imdb_rating: movie.imdb_rating || "",
        description: movie.description || "",
        runtime: extractRuntimeValue(movie.runtime),
        language: movie.language || "",
        country: movie.country || "",
        poster_url: movie.poster_url || "",
        banner_url: movie.banner_url || "",
        trailer_url: movie.trailer_url || "",
        isDisabled: movie.isDisabled || false,
      }
    : {
        title: "",
        type: "",
        year: new Date().getFullYear().toString(),
        genre: [],
        director: "",
        imdb_rating: "",
        description: "",
        runtime: "",
        language: "",
        country: "",
        poster_url: "",
        banner_url: "",
        trailer_url: "",
        isDisabled: false,
      };

  const handleRuntimeChange = (e, setFieldValue) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, "");

    if (numericValue) {
      setFieldValue("runtime", parseInt(numericValue, 10));
    } else {
      setFieldValue("runtime", "");
    }
  };

  if (loading)
    return <div className="loading-overlay">Loading form data...</div>;
  if (error) return <div className="error-overlay">{error}</div>;

  return (
    <div className="movie-form-overlay">
      <div className="movie-form-container">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2>{movie ? "Edit Movie" : "Add New Movie"}</h2>

        <Formik
          initialValues={initialValues}
          validationSchema={MovieSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <Form className="movie-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <Field
                    name="title"
                    type="text"
                    placeholder="Enter movie title"
                  />
                  {errors.title && touched.title && (
                    <div className="error">{errors.title}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <Field
                    as="select"
                    name="type"
                    onChange={(e) => {
                      setFieldValue("type", e.target.value);
                      setFieldValue("runtime", "");
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="Movie">Movie</option>
                    <option value="TV Series">TV Series</option>
                    <option value="Documentary">Documentary</option>
                  </Field>
                  {errors.type && touched.type && (
                    <div className="error">{errors.type}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Year</label>
                  <Field
                    name="year"
                    type="text"
                    placeholder={new Date().getFullYear().toString()}
                  />
                  {errors.year && touched.year && (
                    <div className="error">{errors.year}</div>
                  )}
                </div>

                {values.type && (
                  <div className="form-group runtime-group">
                    <label>
                      Runtime{" "}
                      {values.type === "Movie" ? "(minutes)" : "(episodes)"}
                    </label>
                    <Field name="runtime">
                      {({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="runtime-input"
                          placeholder={values.type === "Movie" ? "120" : "12"}
                          onChange={(e) =>
                            handleRuntimeChange(e, setFieldValue)
                          }
                        />
                      )}
                    </Field>
                    {errors.runtime && touched.runtime && (
                      <div className="error">{errors.runtime}</div>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>Director</label>
                  <Field
                    as="select"
                    name="director"
                    className="director-select"
                  >
                    <option value="">Select Director</option>
                    {directors.map((director) => (
                      <option key={director.id} value={director.id}>
                        {director.name}
                      </option>
                    ))}
                  </Field>
                  {errors.director && touched.director && (
                    <div className="error">{errors.director}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>IMDb Rating</label>
                  <Field
                    name="imdb_rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    placeholder="0.0 - 10.0"
                  />
                  {errors.imdb_rating && touched.imdb_rating && (
                    <div className="error">{errors.imdb_rating}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Genres</label>
                  <div className="genre-grid">
                    {genres.map((genre) => (
                      <label key={genre.id} className="genre-checkbox">
                        <input
                          type="checkbox"
                          checked={values.genre.includes(genre.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFieldValue("genre", [
                                ...values.genre,
                                genre.id,
                              ]);
                            } else {
                              setFieldValue(
                                "genre",
                                values.genre.filter((id) => id !== genre.id)
                              );
                            }
                          }}
                        />
                        {genre.name}
                      </label>
                    ))}
                  </div>
                  {errors.genre && touched.genre && (
                    <div className="error">{errors.genre}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <Field
                    as="textarea"
                    name="description"
                    placeholder="Enter movie description"
                  />
                  {errors.description && touched.description && (
                    <div className="error">{errors.description}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <Field
                    name="language"
                    type="text"
                    placeholder="e.g. English"
                  />
                  {errors.language && touched.language && (
                    <div className="error">{errors.language}</div>
                  )}
                </div>

                <div className="form-group">
                  <label>Country</label>
                  <Field
                    name="country"
                    type="text"
                    placeholder="e.g. United States"
                  />
                  {errors.country && touched.country && (
                    <div className="error">{errors.country}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Poster URL</label>
                  <Field
                    name="poster_url"
                    type="url"
                    placeholder="https://example.com/poster.jpg"
                  />
                  {errors.poster_url && touched.poster_url && (
                    <div className="error">{errors.poster_url}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Banner URL</label>
                  <Field
                    name="banner_url"
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                  />
                  {errors.banner_url && touched.banner_url && (
                    <div className="error">{errors.banner_url}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Trailer URL</label>
                  <Field
                    name="trailer_url"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {errors.trailer_url && touched.trailer_url && (
                    <div className="error">{errors.trailer_url}</div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {movie ? "Update Movie" : "Add Movie"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default MovieForm;
