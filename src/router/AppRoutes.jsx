import Home from "../components/pages/home/Home";
import MovieDetail from "../components/pages/movieDetail/MovieDetail";
import DirectorDetail from "../components/pages/director/DirectorDetail/DirectorDetail";
import ActorDetail from "../components/pages/actor/ActorDetail/ActorDetail";
import DirectorList from "../components/pages/director/DirectorList";
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
import { Navigate } from "react-router";


const AppRoutes = [
  {
    path: "/",
    element: <Layout />,
    errorElement: <NotFound />,
    children: [
      {
        path: "",
        element: <Home />,
      },

      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "movie/:id",
        element: <MovieDetail />,
      },
      {
        path: "director",
        element: <DirectorList />,
      },
      {
        path: "director/:id",
        element: <DirectorDetail />,
      },
      {
        path: "actor/:id",
        element: <ActorDetail />,
      },
      {
        path: "favorites",
        element: <Favorites />,
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
    element: <AdminLayout />,
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
