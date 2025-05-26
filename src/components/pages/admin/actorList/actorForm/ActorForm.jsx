import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const ActorSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Actor name must be at least 3 characters")
    .max(50, "Actor name must be less than 50 characters")
    .required("Actor name is required"),
  bio: Yup.string().max(500, "Bio must be less than 500 characters"),
  isDisabled: Yup.boolean(),
});

const ActorForm = ({ actor, onSubmit, onCancel, isSubmitting }) => {
  const isEditMode = !!actor;

  const initialValues = {
    name: actor?.name || "",
    bio: actor?.bio || "",
    isDisabled: actor?.isDisabled || false,
  };

  return (
    <div className="actor-form-container">
      <h3>{isEditMode ? "Edit Actor" : "Add New Actor"}</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={ActorSchema}
        onSubmit={onSubmit}
      >
        {({ errors, touched, values }) => (
          <Form className="actor-form">
            <div className="form-group">
              <label htmlFor="name">Actor Name</label>
              <Field
                id="name"
                name="name"
                type="text"
                placeholder="Enter actor name"
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
                placeholder="Enter actor bio"
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
                  <span className="label-text">Disable this actor</span>
                </label>
                <small>Disabled actors won't appear in user searches</small>
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
                    ? "Update Actor"
                    : "Add Actor"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ActorForm;