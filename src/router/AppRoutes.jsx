import Home from "../components/pages/home/Home";
import MovieDetail from "../components/pages/movieDetail/MovieDetail";
import Favorites from "../components/pages/favorites/Favorites";
import LoginPage from "../components/auth/LoginPage";
import Layout from "../components/layout/User/Layout";
import ProfilePage from "../components/pages/profile/ProfilePage";
import NotAuthen from "../components/common/NotAuthen";
import NotFound from "../components/common/NotFound";
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
        path: "favorites",
        element: <Favorites />,
      },
      {
        path: "login",
        element: <LoginPage />,
      },
    ],
  },
  {
    path: "/not-authen",
    element: <NotAuthen />,
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
