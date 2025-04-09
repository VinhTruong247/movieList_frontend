import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, useRoutes } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import AppRoutes from './router/AppRoutes';
import './index.scss';

const AppRouter = () => {
  const routes = useRoutes(AppRoutes);
  return routes;
};

function App() {
  return (
    <MovieProvider>
      <Router>
        <AppRouter />
      </Router>
    </MovieProvider>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);