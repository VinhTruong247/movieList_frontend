import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppRoutes from "./AppRoutes";

const router = createBrowserRouter(AppRoutes);

const Router = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default Router;