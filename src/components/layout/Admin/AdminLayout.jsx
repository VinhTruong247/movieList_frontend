 import React, { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router";
import AdminHeader from "./Header";
import { getCurrentUser } from "../../../utils/UserListAPI";
import "./AdminLayout.scss";

const AdminLayout = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData?.userData || null);
      } catch (error) {
        console.error("Error getting current user:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

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
