import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router';
import { Formik, Form, Field } from 'formik';
import { loginUser } from '../../utils/UserListAPI';
import LoginSchema from './Validation';
import './AuthPage.scss';

const LoginPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const response = await loginUser(values.email, values.password);

      if (response.success) {
        if (response.user.isDisable) {
          setError('Your account has been disabled. Please contact support.');
          return;
        }

        if (response.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }
    } catch (err) {
      if (err.message.includes('email')) {
        setError('Email not found');
      } else if (err.message.includes('password')) {
        setError('Incorrect password');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Please sign in to continue</p>

        {error && (
          <div
            className={`auth-error ${error.includes('disabled') ? 'disabled' : ''}`}
          >
            {error}
          </div>
        )}

        <Formik
          initialValues={{
            email: '',
            password: '',
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
                  className={`form-input ${errors.email && touched.email ? 'error' : ''}`}
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
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    className={`form-input ${errors.password && touched.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
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
                <Link to="/forgot-password" className="forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                className={`submit-btn ${!values.email & !values.password ? 'disabled' : ''}`}
                disabled={isSubmitting || !values.email || !values.password}
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
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
