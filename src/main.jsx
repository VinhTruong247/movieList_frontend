import React, { useEffect } from "react";
import supabase from "./supabase-client";
import { useDispatch } from "react-redux";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, useRoutes } from "react-router";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { fetchCurrentUser } from "./redux/slices/authSlice";
import AppRoutes from "./router/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./main.scss";

const AuthStateHandler = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === "SIGNED_IN") {
          setTimeout(() => {
            dispatch(fetchCurrentUser());
          }, 300);
        }
      }
    );

    return () => {
      if (authListener?.subscription?.unsubscribe) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [dispatch]);

  return children;
};

const AppRouter = () => {
  const routes = useRoutes(AppRoutes);
  return routes;
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthStateHandler>
          <ToastContainer position="top-right" autoClose={3000} />
          <AppRouter />
        </AuthStateHandler>
      </Router>
    </Provider>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
