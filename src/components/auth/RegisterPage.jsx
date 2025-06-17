import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { Formik, Form, Field } from "formik";
import { registerUser } from "../../redux/slices/authSlice";
import { useToast } from "../../hooks/useToast";
import { RegisterSchema } from "./Validation";
import "./RegisterPage.scss";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUser = useSelector((state) => state.auth.currentUser);
  const loading = useSelector((state) => state.auth.loading);

  useEffect(() => {
    if (!loading && currentUser) {
      if (currentUser.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    }
  }, [currentUser, loading, navigate]);

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
      await dispatch(
        registerUser({
          email: values.email,
          password: values.password,
          username: values.username,
          name: values.name || values.username,
        })
      ).unwrap();

      setSuccess(
        "Registration successful! Please check your email to verify your account, then sign in."
      );
      toast.success("Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Registration error:", err);

      if (err.message && err.message.includes("already registered")) {
        setError(
          "This email is already registered. Please try signing in instead."
        );
        toast.error("Email already registered");
      } else if (err.message && err.message.includes("Password")) {
        setError("Password must be at least 6 characters long.");
        toast.error("Password too short");
      } else {
        setError(err.message || "Registration failed. Please try again.");
        toast.error("Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
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
                    className={`form-input ${errors.username && touched.username ? "error" : ""}`}
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
                    className={`form-input ${errors.name && touched.name ? "error" : ""}`}
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
                    className={`form-input ${errors.email && touched.email ? "error" : ""}`}
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
                    className={`form-input ${errors.password && touched.password ? "error" : ""}`}
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
                    className={`form-input ${errors.confirmPassword && touched.confirmPassword ? "error" : ""}`}
                    placeholder="Confirm your password"
                  />
                </div>
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="error-message">{errors.confirmPassword}</div>
                )}
              </div>

              <button
                type="submit"
                className={`submit-btn ${!values.email || !values.password || !values.username || !values.confirmPassword ? "disabled" : ""}`}
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
