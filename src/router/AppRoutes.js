import Home from "../components/home/Home";
import MovieDetail from "../components/detail/MovieDetail";
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
    ],
  },
];

export default AppRoutes;