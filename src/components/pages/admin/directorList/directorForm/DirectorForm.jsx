import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import "./DirectorForm.scss";

const DirectorSchema = Yup.object().shape({
  name: Yup.string().min(3).max(50).required("Name is required"),
  biography: Yup.string().max(
    5000,
    "Biography must be less than 5000 characters"
  ),
  nationality: Yup.string().max(50),
  imageUrl: Yup.string().url("Must be a valid URL"),
  isDisabled: Yup.boolean(),
});

const DirectorForm = ({ director, onSubmit, onCancel, isSubmitting }) => {
  const isEditMode = !!director;
  const initialValues = {
    name: director?.name || "",
    biography: director?.biography || "",
    nationality: director?.nationality || "",
    imageUrl: director?.image_url || "",
    isDisabled: director?.isDisabled || false,
  };

  return (
    <div className="director-form-container">
      <div className="form-header">
        <h3>{isEditMode ? "Edit Director" : "Add New Director"}</h3>
      </div>
      <Formik
        initialValues={initialValues}
        validationSchema={DirectorSchema}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ errors, touched }) => (
          <Form className="director-form">
            <div className="form-section">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <Field
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter director name"
                  className={errors.name && touched.name ? "error" : ""}
                  autoFocus
                />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="error-message"
                />
              </div>
              <div className="form-group">
                <label htmlFor="biography">Biography</label>
                <Field
                  id="biography"
                  name="biography"
                  as="textarea"
                  rows="4"
                  placeholder="Enter biography"
                  className={
                    errors.biography && touched.biography ? "error" : ""
                  }
                />
                <ErrorMessage
                  name="biography"
                  component="div"
                  className="error-message"
                />
              </div>
              <div className="form-group">
                <label htmlFor="nationality">Nationality</label>
                <Field
                  id="nationality"
                  name="nationality"
                  type="text"
                  placeholder="Enter nationality"
                  className={
                    errors.nationality && touched.nationality ? "error" : ""
                  }
                />
                <ErrorMessage
                  name="nationality"
                  component="div"
                  className="error-message"
                />
              </div>
              <div className="form-group">
                <label htmlFor="imageUrl">Image URL</label>
                <Field
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className={errors.imageUrl && touched.imageUrl ? "error" : ""}
                />
                <ErrorMessage
                  name="imageUrl"
                  component="div"
                  className="error-message"
                />
              </div>
              {isEditMode && (
                <div className="form-group status-toggle">
                  <label className="checkbox-label">
                    <Field type="checkbox" name="isDisabled" />
                    <span className="label-text">Disable this director</span>
                  </label>
                  <small>
                    Disabled directors won't appear in user searches
                  </small>
                </div>
              )}
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
                    ? "Update Director"
                    : "Add Director"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default DirectorForm;
