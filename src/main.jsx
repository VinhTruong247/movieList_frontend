import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, useRoutes } from "react-router";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { MovieProvider } from "./context/MovieContext";
import AppRoutes from "./router/AppRoutes";
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
