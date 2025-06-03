import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Formik, Form, Field } from "formik";
import { loginUser, getCurrentUser } from "../../services/UserListAPI";
import { LoginSchema } from "./Validation";
import "./LoginPage.scss";

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const userData = await getCurrentUser();
        if (userData && userData.userData) {
          if (userData.userData.isDisabled) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            setError("Your account has been disabled. Please contact support.");
            setCheckingSession(false);
            return;
          }
          
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
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await loginUser({
        email: values.email,
        password: values.password,
      });

      if (response.userData.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      if (err.message.includes("disabled")) {
        setError("Your account has been disabled. Please contact support.");
      } else {
        setError("Invalid email or password. Please try again.");
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
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Please sign in to continue</p>

        {error && (
          <div
            className={`auth-error ${
              error.includes("disabled") ? "disabled" : ""
            }`}
          >
            {error}
          </div>
        )}

        <Formik
          initialValues={{
            email: "",
            password: "",
            rememberMe: false,
          }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting, values }) => (
            <Form className="auth-form">
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
                <div className="password-field">
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

              <div className="form-actions">
                <label className="remember-me">
                  <Field type="checkbox" name="rememberMe" />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                className={`submit-btn ${
                  !values.email || !values.password ? "disabled" : ""
                }`}
                disabled={isSubmitting || !values.email || !values.password}
              >
                {isSubmitting ? "Signing in..." : "Sign In"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="auth-redirect">
          Don't have an account? <Link to="/register">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
