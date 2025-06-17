import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, useRoutes } from "react-router";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { MovieProvider } from "./context/MovieContext";
import AppRoutes from "./router/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./main.scss";

const AppRouter = () => {
  const routes = useRoutes(AppRoutes);
  return routes;
};

function App() {
  return (
    <Provider store={store}>
      <MovieProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <AppRouter />
        </Router>
      </MovieProvider>
    </Provider>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
