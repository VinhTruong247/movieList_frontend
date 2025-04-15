import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import AdminHeader from './Header';
import { getCurrentUser } from '../../../utils/UserListAPI';
import './AdminLayout.scss';

const AdminLayout = () => {
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/login" replace />;
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