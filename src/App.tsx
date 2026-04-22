import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { Landing } from './pages/Landing';
import { Login, Register } from './pages/Auth';
import { DoctorDashboard, AddPatient, CreateRequest, TrackRequests } from './pages/Doctor';
import { AdminDashboard, DoctorApprovals, RequestManagement, PolicyManagement } from './pages/Admin';

const ProtectedRoute: React.FC<{ children: React.ReactNode; role?: 'doctor' | 'admin' }> = ({ children, role }) => {
  const { currentUser } = useAppContext();
  
  if (!currentUser) return <Navigate to="/login" />;
  if (role && currentUser.role !== role) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin-dashboard' : '/doctor-dashboard'} />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Doctor Routes */}
      <Route path="/doctor-dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/add-patient" element={<ProtectedRoute role="doctor"><AddPatient /></ProtectedRoute>} />
      <Route path="/create-request" element={<ProtectedRoute role="doctor"><CreateRequest /></ProtectedRoute>} />
      <Route path="/track-requests" element={<ProtectedRoute role="doctor"><TrackRequests /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin-dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/doctor-approvals" element={<ProtectedRoute role="admin"><DoctorApprovals /></ProtectedRoute>} />
      <Route path="/request-management" element={<ProtectedRoute role="admin"><RequestManagement /></ProtectedRoute>} />
      <Route path="/policy-management" element={<ProtectedRoute role="admin"><PolicyManagement /></ProtectedRoute>} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AppProvider>
  );
}
