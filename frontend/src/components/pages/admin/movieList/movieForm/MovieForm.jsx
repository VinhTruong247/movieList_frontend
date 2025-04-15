import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import './MovieForm.scss';

const genres = [
  { id: "1", name: "Action" },
  { id: "2", name: "Adventure" },
  { id: "3", name: "Animation" },
  { id: "4", name: "Biography" },
  { id: "5", name: "Comedy" },
  { id: "6", name: "Crime" },
  { id: "7", name: "Documentary" },
  { id: "8", name: "Drama" },
  { id: "9", name: "Family" },
  { id: "10", name: "Fantasy" },
  { id: "11", name: "History" },
  { id: "12", name: "Horror" },
  { id: "13", name: "Indie" },
  { id: "14", name: "Medieval" },
  { id: "15", name: "Musical" },
  { id: "16", name: "Mystery" },
  { id: "17", name: "Romance" },
  { id: "18", name: "Sci-Fi" },
  { id: "19", name: "Sport" },
  { id: "20", name: "Thriller" },
  { id: "21", name: "War" },
  { id: "22", name: "Western" }
];

const MovieSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  type: Yup.string().required('Type is required'),
  year: Yup.string().required('Year is required'),
  genre: Yup.array().min(1, 'At least one genre is required'),
  director: Yup.string().required('Director is required'),
  imdb_rating: Yup.number().min(0).max(10).required('Rating is required'),
  description: Yup.string().required('Description is required'),
  runtime: Yup.string()
    .required('Runtime is required')
    .test('valid-runtime', 'Must be a valid number', function(value) {
      if (!value) return false;
      const number = parseInt(value.split(' ')[0]);
      return !isNaN(number) && number > 0;
    }),
  language: Yup.string().required('Language is required'),
  country: Yup.string().required('Country is required'),
  poster: Yup.string().required('Poster URL is required'),
  trailer: Yup.string().required('Trailer URL is required')
});

const MovieForm = ({ movie, onSubmit, onClose }) => {
  const initialValues = movie || {
    title: '',
    type: '',
    year: new Date().getFullYear().toString(),
    genre: [],
    director: '',
    imdb_rating: '',
    description: '',
    runtime: '',
    language: '',
    country: '',
    poster: '',
    trailer: ''
  };

  const handleRuntimeChange = (e, setFieldValue, type) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    setFieldValue('runtime', value);
  };

  return (
    <div className="movie-form-overlay">
      <div className="movie-form-container">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{movie ? 'Edit Movie' : 'Add New Movie'}</h2>
        
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
                      setFieldValue('type', e.target.value);
                      setFieldValue('runtime', '');
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="Movie">Movie</option>
                    <option value="TV Series">TV Series</option>
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
                    <label>Runtime {values.type === 'Movie' ? '(minutes)' : '(episodes)'}</label>
                    <div className="input-group">
                      <Field name="runtime">
                        {({ field }) => (
                          <input
                            {...field}
                            type="text"
                            className="runtime-input"
                            placeholder={values.type === 'Movie' ? '120' : '12'}
                            value={field.value}
                            onChange={(e) => handleRuntimeChange(e, setFieldValue, values.type)}
                          />
                        )}
                      </Field>
                      <span className="input-suffix">
                        {values.type === 'Movie' ? 'min' : 'episodes'}
                      </span>
                    </div>
                    {errors.runtime && touched.runtime && (
                      <div className="error">{errors.runtime}</div>
                    )}
                  </div>
                )}

                <div className="form-group full-width">
                  <label>Genres</label>
                  <div className="genre-grid">
                    {genres.map(genre => (
                      <label key={genre.id} className="genre-checkbox">
                        <input
                          type="checkbox"
                          checked={values.genre.includes(genre.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFieldValue('genre', [...values.genre, genre.name]);
                            } else {
                              setFieldValue('genre', 
                                values.genre.filter(g => g !== genre.name)
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

                <div className="form-group">
                  <label>Director</label>
                  <Field
                    name="director"
                    type="text"
                    placeholder="Enter director's name"
                  />
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
                    name="poster"
                    type="url"
                    placeholder="https://example.com/poster.jpg"
                  />
                  {errors.poster && touched.poster && (
                    <div className="error">{errors.poster}</div>
                  )}
                </div>

                <div className="form-group full-width">
                  <label>Trailer URL</label>
                  <Field
                    name="trailer"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  {errors.trailer && touched.trailer && (
                    <div className="error">{errors.trailer}</div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {movie ? 'Update Movie' : 'Add Movie'}
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