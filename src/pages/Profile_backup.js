import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import LogoutIcon from '@mui/icons-material/Logout';
import userService from '../services/userService';
import bookingService from '../services/bookingService';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData();
    fetchUserBookings();

    // Show success message if redirected from booking
    if (location.state?.bookingSuccess) {
      // Handle success message
    }
  }, [navigate, location.state]);

  const fetchUserData = async () => {
    try {
      const response = await userService.getCurrentUser();
      setUser(response.data);
      setEditFormData({
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email,
        phone: response.data.phone,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Use mock data for development
      const mockUser = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        memberSince: '2024-01-15',
      };
      setUser(mockUser);
      setEditFormData(mockUser);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const response = await bookingService.getUserBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      // Mock bookings data
      setBookings([
        {
          id: 1,
          carName: 'Toyota Camry',
          startDate: '2025-10-01',
          endDate: '2025-10-05',
          status: 'confirmed',
          totalAmount: 180,
          pickupLocation: 'Downtown Office',
        },
        {
          id: 2,
          carName: 'Honda CR-V',
          startDate: '2025-09-15',
          endDate: '2025-09-18',
          status: 'completed',
          totalAmount: 195,
          pickupLocation: 'Airport',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const response = await userService.updateProfile(editFormData);
      setUser(response.data);
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      // For demo purposes, just update local state
      setUser({ ...user, ...editFormData });
      setEditDialogOpen(false);
    }
  };

  const handleInputChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading profile...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {location.state?.bookingSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Your booking has been confirmed successfully!
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Profile Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Profile Information</Typography>
              <Button
                startIcon={<EditIcon />}
                onClick={handleEditProfile}
                size="small"
              >
                Edit
              </Button>
            </Box>

            {user && (
              <Box>
                <Typography variant="h5" gutterBottom>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.email}
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {user.phone}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(user.memberSince).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Paper>
        </Grid>

        {/* Booking History */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Your Bookings
            </Typography>

            {bookings.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No bookings found.
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/cars')}
                >
                  Browse Cars
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {bookings.map((booking) => (
                  <Card key={booking.id} variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {booking.carName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Booking ID: #{booking.id}
                          </Typography>
                        </Box>
                        <Chip
                          label={booking.status.toUpperCase()}
                          color={getStatusColor(booking.status)}
                          size="small"
                        />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Pickup:</strong> {new Date(booking.startDate).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Return:</strong> {new Date(booking.endDate).toLocaleDateString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">
                            <strong>Location:</strong> {booking.pickupLocation}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Total:</strong> ${booking.totalAmount}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="firstName"
                value={editFormData.firstName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={editFormData.lastName}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={editFormData.email}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={editFormData.phone}
                onChange={handleInputChange}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;