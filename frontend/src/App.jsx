import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Garments from './pages/Garments';
import GarmentDetail from './pages/GarmentDetail';
import Measurements from './pages/Measurements';
import Recommendations from './pages/Recommendations';
import SavedLooks from './pages/SavedLooks';
import RetailerDashboard from './pages/RetailerDashboard';
import SharedLook from './pages/SharedLook';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/garments" element={<Garments />} />
            <Route path="/garments/:id" element={<GarmentDetail />} />
            <Route path="/shared-look/:token" element={<SharedLook />} />

            {/* Protected - User */}
            <Route element={<ProtectedRoute allowedRoles={['user', 'retailer']} />}>
              <Route path="/measurements" element={<Measurements />} />
              <Route path="/saved-looks" element={<SavedLooks />} />
            </Route>

            {/* Protected - User only */}
            <Route element={<ProtectedRoute allowedRoles={['user']} />}>
              <Route path="/recommendations" element={<Recommendations />} />
            </Route>

            {/* Protected - Retailer only */}
            <Route element={<ProtectedRoute allowedRoles={['retailer']} />}>
              <Route path="/retailer" element={<RetailerDashboard />} />
            </Route>

            {/* Catch-all */}
            <Route path="/" element={<Navigate to="/garments" replace />} />
            <Route path="*" element={<Navigate to="/garments" replace />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
