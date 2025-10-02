import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import DatabaseConnectivity from './components/DatabaseConnectivity';

// Pages
import Home from './pages/Home';
import Cars from './pages/Cars';
import CarDetails from './pages/CarDetails';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import Users from './pages/Users';
import AdminCars from './pages/AdminCars';
import AddVehicle from './pages/AddVehicle';
import DatabaseSeeder from './pages/DatabaseSeeder';
import DatabaseConnectivityTest from './pages/DatabaseConnectivityTest';
import BackendTest from './pages/BackendTest';

// Utils
import PrivateRoute, { AdminRoute, PublicRoute } from './utils/PrivateRoute';

// Theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            <main>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/cars/:id" element={<CarDetails />} />
              
              {/* Public Routes (only accessible when not logged in) */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />

              {/* Protected Routes (require authentication) */}
              <Route path="/booking" element={
                <PrivateRoute>
                  <Booking />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />

              {/* Admin Only Routes */}
              <Route path="/admin/users" element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              } />
              <Route path="/admin/cars" element={
                <AdminRoute>
                  <AdminCars />
                </AdminRoute>
              } />
              <Route path="/admin/cars/add" element={
                <AdminRoute>
                  <AddVehicle />
                </AdminRoute>
              } />
              
              {/* Development/Testing Routes */}
              <Route path="/test-backend" element={<BackendTest />} />
              <Route path="/seed-database" element={<DatabaseSeeder />} />
              <Route path="/test-connectivity" element={<DatabaseConnectivityTest />} />
              <Route path="/mysql-test" element={<DatabaseConnectivity />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
