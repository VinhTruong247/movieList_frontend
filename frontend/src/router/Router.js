import { createBrowserRouter, RouterProvider } from 'react-router';
import AppRoutes from './AppRoutes';

const router = createBrowserRouter(AppRoutes);

const Router = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

export default Router;
