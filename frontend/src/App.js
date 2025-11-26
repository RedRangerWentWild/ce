import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import VendorWithdrawals from "./pages/VendorWithdrawals";
import AdminDashboard from "./pages/AdminDashboard";
import AdminStats from "./pages/AdminStats";
import Wallet from "./pages/Wallet";
import Complaints from "./pages/Complaints";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Navigate to="/student/dashboard" />;
    if (user.role === 'vendor') return <Navigate to="/vendor/dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (user.role === 'student') return <Navigate to="/student/dashboard" />;
  if (user.role === 'vendor') return <Navigate to="/vendor/dashboard" />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" />;
  
  return <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<HomeRedirect />} />
            
            {/* Student Routes */}
            <Route path="student" element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="wallet" element={<Wallet />} />
              <Route path="complaints" element={<Complaints />} />
            </Route>

            {/* Vendor Routes */}
            <Route path="vendor" element={<ProtectedRoute allowedRoles={['vendor']} />}>
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="withdrawals" element={<VendorWithdrawals />} />
            </Route>

            {/* Admin Routes */}
            <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="stats" element={<AdminStats />} />
              <Route path="complaints" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
