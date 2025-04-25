import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { PasswordChangeSchema } from "../../auth/Validation";
import { updateUser, verifyPassword } from "../../../utils/UserListAPI";
import "./ChangePassword.scss";

const ChangePassword = ({ currentUser, onSuccess, onError }) => {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm, setFieldError }
  ) => {
    try {
      const isValidPassword = await verifyPassword(
        currentUser.id,
        values.currentPassword
      );
      if (!isValidPassword) {
        setFieldError("currentPassword", "Current password is incorrect");
        return;
      }

      const updatedUser = {
        ...currentUser,
        password: values.newPassword,
        currentPassword: values.currentPassword,
      };

      await updateUser(currentUser.id, updatedUser);
      resetForm();
      setShowForm(false);
      onSuccess("Password updated successfully!");
      setTimeout(() => onSuccess(""), 3000);
    } catch (error) {
      onError(error.errors ? error.errors[0] : "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="password-section">
      {!showForm ? (
        <button className="save-button" onClick={() => setShowForm(true)}>
          Reset Password
        </button>
      ) : (
        <>
          <div className="section-header">
            <h3>Change Password</h3>
            <button
              className="cancel-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>

          <Formik
            initialValues={{
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            }}
            validationSchema={PasswordChangeSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, isValid, dirty }) => (
              <Form className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <Field
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    className={
                      errors.currentPassword && touched.currentPassword
                        ? "error"
                        : ""
                    }
                  />
                  {errors.currentPassword && touched.currentPassword && (
                    <div className="error-message">
                      {errors.currentPassword}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <Field
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    className={
                      errors.newPassword && touched.newPassword ? "error" : ""
                    }
                  />
                  {errors.newPassword && touched.newPassword && (
                    <div className="error-message">{errors.newPassword}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    className={
                      errors.confirmPassword && touched.confirmPassword
                        ? "error"
                        : ""
                    }
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="error-message">
                      {errors.confirmPassword}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className={`save-button ${!isValid || !dirty || isSubmitting ? "disabled" : ""}`}
                  disabled={!isValid || !dirty || isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </Form>
            )}
          </Formik>
        </>
      )}
    </div>
  );
};

export default ChangePassword;
