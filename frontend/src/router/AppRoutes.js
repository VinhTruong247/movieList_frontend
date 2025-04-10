import Home from "../components/pages/home/Home";
import MovieDetail from "../components/pages/detail/MovieDetail";
import Favorites from "../components/pages/favorites/Favorites";
import LoginPage from "../components/auth/LoginPage";
import Layout from "../components/layout/Layout";

const AppRoutes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "movie/:id",
        element: <MovieDetail />,
      },
      {
        path: 'favorites',
        element: <Favorites />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
];

export default AppRoutes;