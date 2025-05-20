import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Formik, Form, Field } from "formik";
import { signUp } from "../../utils/UserListAPI";
import { RegisterSchema } from "./Validation";
import "./RegisterPage.scss";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        navigate("/login");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await signUp({
        email: values.email,
        password: values.password,
        username: values.username,
        name: values.username,
      });

      setSuccess("Registration successful! Redirecting to login...");
    } catch (err) {
      if (err.message?.includes("email")) {
        setError("This email is already registered. Please use another email.");
      } else if (err.message?.includes("username")) {
        setError("This username is already taken. Please choose another one.");
      } else {
        setError("Registration failed. Please try again later.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join our movie community</p>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <Formik
          initialValues={{
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <Field
                  type="text"
                  name="username"
                  id="username"
                  className={`form-input ${
                    errors.username && touched.username ? "error" : ""
                  }`}
                  placeholder="Choose a username"
                />
                {errors.username && touched.username && (
                  <div className="error-message">{errors.username}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={`form-input ${
                    errors.email && touched.email ? "error" : ""
                  }`}
                  placeholder="Enter your email"
                />
                {errors.email && touched.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`form-input ${
                    errors.password && touched.password ? "error" : ""
                  }`}
                  placeholder="Create a password"
                />
                {errors.password && touched.password && (
                  <div className="error-message">{errors.password}</div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
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
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>

              <button
                type="submit"
                className={`submit-btn ${
                  !values.username ||
                  !values.email ||
                  !values.password ||
                  !values.confirmPassword ||
                  isSubmitting
                    ? "disabled"
                    : ""
                }`}
                disabled={
                  isSubmitting ||
                  !values.username ||
                  !values.email ||
                  !values.password ||
                  !values.confirmPassword
                }
              >
                {isSubmitting ? "Registering..." : "Sign Up"}
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
