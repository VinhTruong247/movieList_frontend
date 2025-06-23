import { Outlet, useLocation } from "react-router";
import { useLayoutEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import "./Layout.scss";

const Layout = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
