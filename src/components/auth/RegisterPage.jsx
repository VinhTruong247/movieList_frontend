import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Formik, Form, Field } from "formik";
import { signUp, getCurrentUser } from "../../services/UserListAPI";
import { RegisterSchema } from "./Validation";
import "./RegisterPage.scss";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData && userData.userData) {
          if (userData.userData.role === "admin") {
            navigate("/admin");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setCheckingSession(false);
      }
    };

    checkExistingSession();
  }, [navigate]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await signUp({
        email: values.email,
        password: values.password,
        username: values.username,
        name: values.name || values.username,
      });

      setSuccess(
        "Registration successful! Please check your email to verify your account, then sign in."
      );

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);
      if (err.message.includes("already registered")) {
        setError(
          "This email is already registered. Please try signing in instead."
        );
      } else if (err.message.includes("Password")) {
        setError("Password must be at least 6 characters long.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="auth-container">
        <div className="auth-box checking-session">
          <p>Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">
          Join us to start building your movie list
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <Formik
          initialValues={{
            username: "",
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, values, isSubmitting }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <div className="input-wrapper">
                  <Field
                    type="text"
                    name="username"
                    id="username"
                    className={`form-input ${
                      errors.username && touched.username ? "error" : ""
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && touched.username && (
                  <div className="error-message">{errors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="name">Name</label>
                <div className="input-wrapper">
                  <Field
                    type="text"
                    name="name"
                    id="name"
                    className={`form-input ${
                      errors.name && touched.name ? "error" : ""
                    }`}
                    placeholder="Enter your name (optional)"
                  />
                </div>
                {errors.name && touched.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <div className="input-wrapper">
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    className={`form-input ${
                      errors.email && touched.email ? "error" : ""
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && touched.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password *</label>
                <div className="input-wrapper">
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className={`form-input ${
                      errors.password && touched.password ? "error" : ""
                    }`}
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && touched.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="input-wrapper">
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className={`form-input ${
                      errors.confirmPassword && touched.confirmPassword
                        ? "error"
                        : ""
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>

              <button
                type="submit"
                className={`submit-btn ${
                  !values.email ||
                  !values.password ||
                  !values.username ||
                  !values.confirmPassword
                    ? "disabled"
                    : ""
                }`}
                disabled={
                  isSubmitting ||
                  !values.email ||
                  !values.password ||
                  !values.username ||
                  !values.confirmPassword
                }
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="auth-redirect">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
