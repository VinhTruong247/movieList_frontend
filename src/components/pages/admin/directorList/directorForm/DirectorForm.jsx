import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const DirectorSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Director name must be at least 3 characters")
    .max(50, "Director name must be less than 50 characters")
    .required("Director name is required"),
  biography: Yup.string().max(500, "Biography must be less than 500 characters"),
  nationality: Yup.string().max(50, "Nationality must be less than 50 characters"),
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
    <div className="form-container">
      <h3>{isEditMode ? "Edit Director" : "Add New Director"}</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={DirectorSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched, values }) => (
          <Form className="form-list">
            <div className="form-group">
              <label htmlFor="name">Director Name *</label>
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
              <label htmlFor="biography">Biography (Optional)</label>
              <Field
                id="biography"
                name="biography"
                as="textarea"
                rows="4"
                placeholder="Enter director biography"
                className={errors.biography && touched.biography ? "error" : ""}
              />
              <ErrorMessage
                name="biography"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nationality">Nationality (Optional)</label>
              <Field
                id="nationality"
                name="nationality"
                type="text"
                placeholder="Enter director nationality"
                className={errors.nationality && touched.nationality ? "error" : ""}
              />
              <ErrorMessage
                name="nationality"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Image URL (Optional)</label>
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
                <small>Disabled directors won't appear in user searches</small>
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
