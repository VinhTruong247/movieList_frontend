import Home from "../components/pages/home/Home";
import MovieDetail from "../components/pages/movie/movieDetail/MovieDetail";
import DirectorDetail from "../components/pages/director/DirectorDetail/DirectorDetail";
import ActorDetail from "../components/pages/actor/ActorDetail/ActorDetail";
import DirectorList from "../components/pages/director/DirectorList";
import ActorList from "../components/pages/actor/ActorList";
import Favorites from "../components/pages/favorites/Favorites";
import SocialPage from "../components/pages/social/SocialPage";
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
import MovieList from "../components/pages/movie/MovieList";

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
        path: "profile/:userId",
        element: <ProfilePage />,
      },
      {
        path: "movies",
        element: <MovieList />,
      },
      {
        path: "movies/:movieId",
        element: <MovieDetail />,
      },
      {
        path: "directors",
        element: <DirectorList />,
      },
      {
        path: "directors/:directorId",
        element: <DirectorDetail />,
      },
      {
        path: "actors",
        element: <ActorList />,
      },
      {
        path: "actors/:actorId",
        element: <ActorDetail />,
      },
      {
        path: "favorites",
        element: <Favorites />,
      },
      {
        path: "social",
        element: <SocialPage />,
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
