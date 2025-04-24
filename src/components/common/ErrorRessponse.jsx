import React from "react";
import { useRouteError, isRouteErrorResponse } from "react-router";
import NotFound from "./NotFound";
import NotAuthen from "./NotAuthen";

const ErrorBoundary = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      return <NotFound />;
    }
    if (error.status === 401) {
      return <NotAuthen />;
    }
  }

  return (
    <div className="error-container">
      <h1>Oops! Something went wrong</h1>
      <p>An unexpected error occurred. Please try again later.</p>
    </div>
  );
};

export default ErrorBoundary;
