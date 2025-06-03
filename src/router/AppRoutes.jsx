import Home from "../components/pages/home/Home";
import MovieDetail from "../components/pages/movieDetail/MovieDetail";
import Favorites from "../components/pages/favorites/Favorites";
import LoginPage from "../components/auth/LoginPage";
import RegisterPage from "../components/auth/RegisterPage";
import Layout from "../components/layout/User/Layout";
import AdminLayout from "../components/layout/Admin/AdminLayout";
import AdminPage from "../components/pages/admin/AdminPage";
import ProfilePage from "../components/pages/profile/ProfilePage";
import NotAuthen from "../components/common/NotAuthen";
import NotFound from "../components/common/NotFound";
import NotLogin from "../components/common/NotLogin";
import ProtectedRoute from "./ProtectedRoute";
import { Navigate } from "react-router";

const AppRoutes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: (
          <ProtectedRoute allowGuest={true}>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "movie/:id",
        element: (
          <ProtectedRoute allowGuest={true}>
            <MovieDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "favorites",
        element: (
          <ProtectedRoute>
            <Favorites />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: "admin",
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <AdminPage />,
      },
    ],
  },
  {
    path: "/not-authen",
    element: <NotAuthen />,
  },
  {
    path: "/not-login",
    element: <NotLogin />,
  },
  {
    path: "/404",
    element: <NotFound />,
  },
  {
    path: "*",
    element: <Navigate to="/404" replace />,
  },
];

export default AppRoutes;
