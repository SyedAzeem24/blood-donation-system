import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Dashboard
import Dashboard from './pages/dashboard/Dashboard';

// Donation Pages
import CreateDonation from './pages/donations/CreateDonation';
import MyDonations from './pages/donations/MyDonations';
import AvailableDonations from './pages/donations/AvailableDonations';
import DonationHistory from './pages/donations/DonationHistory';

// Request Pages
import CreateRequest from './pages/requests/CreateRequest';
import MyRequests from './pages/requests/MyRequests';
import BloodRequests from './pages/requests/BloodRequests';

// Other Pages
import Notifications from './pages/notifications/Notifications';
import Profile from './pages/profile/Profile';

// Admin Pages
import ManageUsers from './pages/admin/ManageUsers';
import ManagePosts from './pages/admin/ManagePosts';

// Error Pages
import NotFound from './pages/errors/NotFound';
import Unauthorized from './pages/errors/Unauthorized';

import './App.css';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
            
            {/* Protected Routes - All Users */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />

            {/* Donor Routes */}
            <Route path="/create-donation" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <CreateDonation />
              </ProtectedRoute>
            } />
            <Route path="/my-donations" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <MyDonations />
              </ProtectedRoute>
            } />
            <Route path="/donation-history" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonationHistory />
              </ProtectedRoute>
            } />
            <Route path="/blood-requests" element={
              <ProtectedRoute allowedRoles={['donor']}>
                <BloodRequests />
              </ProtectedRoute>
            } />

            {/* Receiver Routes */}
            <Route path="/create-request" element={
              <ProtectedRoute allowedRoles={['receiver']}>
                <CreateRequest />
              </ProtectedRoute>
            } />
            <Route path="/my-requests" element={
              <ProtectedRoute allowedRoles={['receiver']}>
                <MyRequests />
              </ProtectedRoute>
            } />
            <Route path="/available-donations" element={
              <ProtectedRoute allowedRoles={['receiver']}>
                <AvailableDonations />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/posts" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManagePosts />
              </ProtectedRoute>
            } />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/404" element={<NotFound />} />
            
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
  );
}

export default App;
