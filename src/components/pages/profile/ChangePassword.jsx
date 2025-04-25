import React, { useState } from "react";
import { PasswordChangeSchema } from "../../auth/Validation";
import { updateUser } from "../../../utils/UserListAPI";
import "./ChangePassword.scss";

const ChangePassword = ({ currentUser, onSuccess, onError }) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    try {
      await PasswordChangeSchema.validate(
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        },
        { abortEarly: false }
      );

      const updatedUser = {
        ...currentUser,
        password: formData.newPassword,
        currentPassword: formData.currentPassword,
      };

      await updateUser(currentUser.id, updatedUser);

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowForm(false);
      onSuccess("Password updated successfully!");
    } catch (error) {
      onError(error.errors ? error.errors[0] : "Failed to update password");
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
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                placeholder="Enter new password"
                minLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm new password"
                minLength="6"
                required
              />
            </div>

            <button type="submit" className="save-button">
              Update Password
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ChangePassword;
