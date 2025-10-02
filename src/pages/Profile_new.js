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
  Avatar,
  Chip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  Fade,
  Skeleton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Edit as EditIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  DirectionsCar as CarIcon,
  Settings as SettingsIcon,
  PhotoCamera as PhotoCameraIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
  History as HistoryIcon,
  AccountBox as AccountBoxIcon,
} from '@mui/icons-material';
import userService from '../services/userService';
import bookingService from '../services/bookingService';

// Styled components for better visual appeal
const ProfileHeader = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: theme.spacing(0, 'auto', 2),
  border: `4px solid ${theme.palette.common.white}`,
  fontSize: '3rem',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
}));

const StatCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[10],
  },
  transition: 'all 0.3s ease-in-out',
}));

const BookingCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[8],
  },
  transition: 'all 0.3s ease-in-out',
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
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
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      // For demo purposes, get user from localStorage
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser({
          id: 1,
          username: parsedUser.username || 'johndoe',
          firstName: parsedUser.firstName || 'John',
          lastName: parsedUser.lastName || 'Doe',
          email: parsedUser.email || 'john.doe@example.com',
          phone: parsedUser.phone || '+1 (555) 123-4567',
          joinDate: '2024-01-15',
          totalBookings: 5,
          totalSpent: 1250.00,
          favoriteCarType: 'SUV',
          membershipLevel: 'Gold',
        });
        setEditFormData({
          username: parsedUser.username || 'johndoe',
          firstName: parsedUser.firstName || 'John',
          lastName: parsedUser.lastName || 'Doe',
          email: parsedUser.email || 'john.doe@example.com',
          phone: parsedUser.phone || '+1 (555) 123-4567',
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserBookings = async () => {
    try {
      // Demo booking data
      setBookings([
        {
          id: 1,
          carName: 'Tesla Model 3',
          carImage: '/api/placeholder/300/200',
          startDate: '2025-10-01',
          endDate: '2025-10-05',
          status: 'confirmed',
          totalAmount: 320.00,
          pickupLocation: 'Downtown Office',
          returnLocation: 'Airport',
          duration: '4 days',
        },
        {
          id: 2,
          carName: 'BMW X5',
          carImage: '/api/placeholder/300/200',
          startDate: '2025-09-15',
          endDate: '2025-09-18',
          status: 'completed',
          totalAmount: 275.00,
          pickupLocation: 'Airport',
          returnLocation: 'Hotel District',
          duration: '3 days',
        },
        {
          id: 3,
          carName: 'Mercedes C-Class',
          carImage: '/api/placeholder/300/200',
          startDate: '2025-08-10',
          endDate: '2025-08-15',
          status: 'completed',
          totalAmount: 455.00,
          pickupLocation: 'City Center',
          returnLocation: 'City Center',
          duration: '5 days',
        },
      ]);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Trigger storage event to update header
    window.dispatchEvent(new Event('storage'));
    navigate('/');
  };

  const handleEditProfile = () => {
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      // For demo purposes, update local storage and state
      const updatedUser = { ...user, ...editFormData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(editFormData));
      
      // Trigger storage event to update header
      window.dispatchEvent(new Event('storage'));
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
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
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          <Grid container spacing={3}>
            {[...Array(4)].map((_, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Fade in timeout={1000}>
        <Box>
          {/* Profile Header */}
          <ProfileHeader elevation={3}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} textAlign="center">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      size="small"
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'grey.100' }
                      }}
                    >
                      <PhotoCameraIcon fontSize="small" />
                    </IconButton>
                  }
                >
                  <StyledAvatar>
                    {user && getInitials(user.firstName, user.lastName)}
                  </StyledAvatar>
                </Badge>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  @{user?.username}
                </Typography>
                <Chip
                  label={user?.membershipLevel || 'Standard'}
                  color="warning"
                  sx={{ mt: 1, color: 'white', fontWeight: 'bold' }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <StatCard elevation={2}>
                      <CarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {user?.totalBookings || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Rentals
                      </Typography>
                    </StatCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard elevation={2}>
                      <MoneyIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        ${user?.totalSpent || 0}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Spent
                      </Typography>
                    </StatCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard elevation={2}>
                      <StarIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        4.8
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Rating
                      </Typography>
                    </StatCard>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard elevation={2}>
                      <CalendarIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold" color="info.main">
                        {new Date(user?.joinDate || '2024-01-01').getFullYear()}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Member Since
                      </Typography>
                    </StatCard>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </ProfileHeader>

          {/* Main Content with Tabs */}
          <Paper elevation={3} sx={{ borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} centered>
                <Tab icon={<PersonIcon />} label="Profile Info" />
                <Tab icon={<HistoryIcon />} label="Booking History" />
                <Tab icon={<SettingsIcon />} label="Settings" />
              </Tabs>
            </Box>

            {/* Profile Info Tab */}
            <TabPanel value={tabValue} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                        Personal Information
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <PersonIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Full Name"
                            secondary={`${user?.firstName} ${user?.lastName}`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <AccountBoxIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Username"
                            secondary={user?.username}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <EmailIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Email"
                            secondary={user?.email}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <PhoneIcon color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Phone"
                            secondary={user?.phone}
                          />
                        </ListItem>
                      </List>
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          startIcon={<EditIcon />}
                          onClick={handleEditProfile}
                          sx={{ mr: 2 }}
                        >
                          Edit Profile
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<LogoutIcon />}
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card elevation={2} sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                        Account Summary
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemIcon>
                            <CalendarIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Member Since"
                            secondary={new Date(user?.joinDate || '2024-01-01').toLocaleDateString()}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <CarIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Favorite Car Type"
                            secondary={user?.favoriteCarType}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemIcon>
                            <StarIcon color="secondary" />
                          </ListItemIcon>
                          <ListItemText
                            primary="Membership Level"
                            secondary={user?.membershipLevel}
                          />
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>

            {/* Booking History Tab */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Recent Bookings
              </Typography>
              {bookings.length === 0 ? (
                <Alert severity="info">No bookings found. Start exploring our cars!</Alert>
              ) : (
                <Grid container spacing={3}>
                  {bookings.map((booking) => (
                    <Grid item xs={12} md={6} lg={4} key={booking.id}>
                      <BookingCard elevation={2}>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight="bold">
                              {booking.carName}
                            </Typography>
                            <Chip
                              label={booking.status}
                              color={getStatusColor(booking.status)}
                              size="small"
                            />
                          </Box>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              <CalendarIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              {booking.startDate} to {booking.endDate}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                              <LocationIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              {booking.pickupLocation} → {booking.returnLocation}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              <MoneyIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                              ${booking.totalAmount.toFixed(2)} ({booking.duration})
                            </Typography>
                          </Box>
                          <Button size="small" variant="outlined" fullWidth>
                            View Details
                          </Button>
                        </CardContent>
                      </BookingCard>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Settings Tab */}
            <TabPanel value={tabValue} index={2}>
              <Typography variant="h6" gutterBottom color="primary" fontWeight="bold">
                Account Settings
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Preferences
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText primary="Email Notifications" secondary="Receive booking confirmations" />
                          <Button size="small" variant="outlined">
                            Manage
                          </Button>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="SMS Alerts" secondary="Get rental reminders" />
                          <Button size="small" variant="outlined">
                            Manage
                          </Button>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Newsletter" secondary="Monthly car rental tips" />
                          <Button size="small" variant="outlined">
                            Manage
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Security
                      </Typography>
                      <List>
                        <ListItem>
                          <ListItemText primary="Change Password" secondary="Update your password" />
                          <Button size="small" variant="outlined">
                            Change
                          </Button>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Two-Factor Auth" secondary="Add extra security" />
                          <Button size="small" variant="outlined">
                            Enable
                          </Button>
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Login History" secondary="View recent logins" />
                          <Button size="small" variant="outlined">
                            View
                          </Button>
                        </ListItem>
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </TabPanel>
          </Paper>
        </Box>
      </Fade>

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
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="lastName"
                value={editFormData.lastName}
                onChange={handleInputChange}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Username"
                name="username"
                value={editFormData.username}
                onChange={handleInputChange}
                variant="outlined"
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
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={editFormData.phone}
                onChange={handleInputChange}
                variant="outlined"
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