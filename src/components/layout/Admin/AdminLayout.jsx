import React from "react";
import { Outlet, Navigate } from "react-router";
import AdminHeader from "./Header";
import { getCurrentUser } from "../../../utils/UserListAPI";
import "./AdminLayout.scss";

const AdminLayout = () => {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/not-authen" replace state={{ status: 401 }} />;
  }

  if (currentUser.role !== "admin") {
    return <Navigate to="/not-authen" replace state={{ status: 403 }} />;
  }

  return (
    <div className="admin-layout">
      <AdminHeader />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
