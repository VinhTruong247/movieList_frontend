import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './GenreForm.scss';

const GenreSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Genre name must be at least 3 characters')
    .max(30, 'Genre name must be less than 30 characters')
    .required('Genre name is required'),
  isDisabled: Yup.boolean()
});

const GenreForm = ({ genre, onSubmit, onCancel, isSubmitting }) => {
  const isEditMode = !!genre;
  
  const initialValues = {
    name: genre?.name || '',
    isDisabled: genre?.isDisabled || false
  };

  return (
    <div className="genre-form-container">
      <h3>{isEditMode ? 'Edit Genre' : 'Add New Genre'}</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={GenreSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched, values }) => (
          <Form className="genre-form">
            <div className="form-group">
              <label htmlFor="name">Genre Name</label>
              <Field
                id="name"
                name="name"
                type="text"
                placeholder="Enter genre name"
                autoFocus
              />
              <ErrorMessage name="name" component="div" className="error-message" />
            </div>

            {isEditMode && (
              <div className="form-group status-toggle">
                <label className="checkbox-label">
                  <Field type="checkbox" name="isDisabled" />
                  <span className="label-text">Disable this genre</span>
                </label>
                <small>Disabled genres won't appear in user searches</small>
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
                  ? 'Saving...'
                  : isEditMode
                    ? 'Update Genre'
                    : 'Add Genre'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default GenreForm;