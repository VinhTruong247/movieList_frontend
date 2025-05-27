import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const DirectorSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Director name must be at least 3 characters")
    .max(50, "Director name must be less than 50 characters")
    .required("Director name is required"),
  bio: Yup.string().max(500, "Bio must be less than 500 characters"),
  isDisabled: Yup.boolean(),
});

const DirectorForm = ({ director, onSubmit, onCancel, isSubmitting }) => {
  const isEditMode = !!director;

  const initialValues = {
    name: director?.name || "",
    bio: director?.bio || "",
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
              <label htmlFor="name">Director Name</label>
              <Field
                id="name"
                name="name"
                type="text"
                placeholder="Enter director name"
                autoFocus
              />
              <ErrorMessage
                name="name"
                component="div"
                className="error-message"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Biography (Optional)</label>
              <Field
                id="bio"
                name="bio"
                as="textarea"
                rows="4"
                placeholder="Enter director bio"
              />
              <ErrorMessage
                name="bio"
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
