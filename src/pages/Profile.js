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
import authService from '../services/authService';

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
  
  // Profile picture states
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUserData();
    fetchUserBookings();

    // Listen for storage changes (when user data is updated)
    const handleStorageChange = () => {
      fetchUserData();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  const fetchUserData = async () => {
    try {
      // Get user from localStorage (set during login/registration)
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        
        // Use actual user data from login/registration
        setUser({
          id: parsedUser.id || Date.now(), // Generate ID if not available
          username: parsedUser.username || 'Unknown User',
          firstName: parsedUser.firstName || parsedUser.username?.split(' ')[0] || 'User',
          lastName: parsedUser.lastName || parsedUser.username?.split(' ')[1] || '',
          email: parsedUser.email || 'No email provided',
          phone: parsedUser.phone || 'No phone provided',
          joinDate: parsedUser.joinDate || new Date().toISOString().split('T')[0], // Today's date if not available
          totalBookings: parsedUser.totalBookings || 0,
          totalSpent: parsedUser.totalSpent || 0.00,
          favoriteCarType: parsedUser.favoriteCarType || 'Not specified',
          membershipLevel: parsedUser.membershipLevel || 'Standard',
          profilePicture: parsedUser.profilePicture || null, // Load profile picture if exists
        });
        
        setEditFormData({
          username: parsedUser.username || '',
          firstName: parsedUser.firstName || parsedUser.username?.split(' ')[0] || '',
          lastName: parsedUser.lastName || parsedUser.username?.split(' ')[1] || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
        });
      } else {
        // No user data found, redirect to login
        navigate('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If there's an error parsing user data, redirect to login
      navigate('/login');
    }
  };

  const fetchUserBookings = async () => {
    try {
      console.log('📚 Fetching user bookings from database...');
      
      // Check authentication first
      const isAuthenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();
      
      if (!isAuthenticated || !currentUser) {
        console.log('❌ User not authenticated, clearing bookings');
        setBookings([]);
        return;
      }

      // Try to fetch from backend
      const response = await bookingService.getUserBookings();
      
      if (response.data && Array.isArray(response.data)) {
        console.log('✅ Successfully fetched bookings from database:', response.data);
        
        // Format the booking data to match our UI requirements
        const formattedBookings = response.data.map(booking => ({
          id: booking.id,
          carName: booking.carName || booking.car?.name || 'Unknown Car',
          carImage: booking.carImage || booking.car?.imageUrl || '/api/placeholder/300/200',
          startDate: booking.startDate,
          endDate: booking.endDate,
          status: booking.status || 'confirmed',
          totalAmount: parseFloat(booking.totalAmount || 0),
          pickupLocation: booking.pickupLocation || 'Not specified',
          returnLocation: booking.dropoffLocation || booking.returnLocation || booking.pickupLocation || 'Same as pickup',
          duration: calculateDuration(booking.startDate, booking.endDate),
          bookingDate: booking.createdAt || booking.bookingDate,
          carId: booking.carId,
          personalInfo: booking.personalInfo,
          additionalOptions: booking.additionalOptions,
        }));
        
        setBookings(formattedBookings);
        
        // Update user's total bookings count
        if (formattedBookings.length > 0) {
          setUser(prev => ({
            ...prev,
            totalBookings: formattedBookings.length
          }));
        }
      } else {
        console.log('⚠️ No bookings found in response');
        setBookings([]);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings from database:', error);
      
      // Fallback to demo data if database fails
      console.log('📝 Using fallback demo booking data');
      setBookings([
        {
          id: 'DEMO_1',
          carName: 'Tesla Model 3',
          carImage: '/api/placeholder/300/200',
          startDate: '2025-01-01',
          endDate: '2025-01-05',
          status: 'confirmed',
          totalAmount: 320.00,
          pickupLocation: 'Downtown Office',
          returnLocation: 'Airport',
          duration: '4 days',
          bookingDate: '2024-12-15',
        },
        {
          id: 'DEMO_2',
          carName: 'BMW X5',
          carImage: '/api/placeholder/300/200',
          startDate: '2024-12-15',
          endDate: '2024-12-18',
          status: 'completed',
          totalAmount: 275.00,
          pickupLocation: 'Airport',
          returnLocation: 'Hotel District',
          duration: '3 days',
          bookingDate: '2024-12-01',
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate booking duration
  const calculateDuration = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Unknown duration';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
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

  // Profile picture handling functions
  const handleProfilePictureClick = () => {
    setUploadDialogOpen(true);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      setProfilePicture(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = () => {
    if (imagePreview) {
      // Save to localStorage (in a real app, this would be uploaded to server)
      const updatedUser = {
        ...user,
        profilePicture: imagePreview
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Trigger storage event to update header
      window.dispatchEvent(new Event('storage'));
      
      setUploadDialogOpen(false);
      setProfilePicture(null);
      setImagePreview(null);
    }
  };

  const handleImageCancel = () => {
    setUploadDialogOpen(false);
    setProfilePicture(null);
    setImagePreview(null);
  };

  const handleRemoveProfilePicture = () => {
    const updatedUser = {
      ...user,
      profilePicture: null
    };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Trigger storage event to update header
    window.dispatchEvent(new Event('storage'));
    
    setUploadDialogOpen(false);
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

  const getInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (username) {
      return username.charAt(0).toUpperCase();
    }
    return 'U'; // Default fallback
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
                      onClick={handleProfilePictureClick}
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
                  <StyledAvatar src={user?.profilePicture}>
                    {!user?.profilePicture && user && getInitials(user.firstName, user.lastName, user.username)}
                  </StyledAvatar>
                </Badge>
                <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || user?.username || 'User'
                  }
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  📚 Booking History
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Total: {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
                </Typography>
              </Box>
              
              {bookings.length === 0 ? (
                <Card elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="h6" color="textSecondary" gutterBottom>
                    🚗 No bookings found
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Start exploring our amazing car collection!
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/cars')}
                    sx={{ mt: 1 }}
                  >
                    Browse Cars
                  </Button>
                </Card>
              ) : (
                <Grid container spacing={3}>
                  {bookings.map((booking) => (
                    <Grid item xs={12} md={6} lg={4} key={booking.id}>
                      <BookingCard elevation={3} sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                        <CardContent>
                          {/* Header with car name and status */}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5 }}>
                                {booking.carName}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Booking #{booking.id}
                              </Typography>
                            </Box>
                            <Chip
                              label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              color={getStatusColor(booking.status)}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </Box>

                          {/* Car image placeholder */}
                          <Box sx={{ 
                            height: 120, 
                            bgcolor: 'grey.100', 
                            borderRadius: 1, 
                            mb: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <Typography variant="body2" color="textSecondary">
                              🚗 {booking.carName}
                            </Typography>
                          </Box>

                          {/* Booking details */}
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                              <strong>Dates:</strong>&nbsp;
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </Typography>
                            
                            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                              <strong>Pickup:</strong>&nbsp;{booking.pickupLocation}
                            </Typography>
                            
                            {booking.returnLocation !== booking.pickupLocation && (
                              <Typography variant="body2" color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                <LocationIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                                <strong>Return:</strong>&nbsp;{booking.returnLocation}
                              </Typography>
                            )}
                            
                            <Typography variant="body2" color="textSecondary" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                              <MoneyIcon fontSize="small" sx={{ mr: 1, color: 'success.main' }} />
                              <strong>Total:</strong>&nbsp;${booking.totalAmount.toFixed(2)} ({booking.duration})
                            </Typography>

                            {booking.bookingDate && (
                              <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'info.main' }} />
                                <strong>Booked:</strong>&nbsp;{new Date(booking.bookingDate).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          {/* Action buttons */}
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              fullWidth
                              onClick={() => {
                                // Could open a detail modal or navigate to details page
                                console.log('View booking details:', booking.id);
                              }}
                            >
                              View Details
                            </Button>
                            {booking.status === 'confirmed' && (
                              <Button 
                                size="small" 
                                variant="text" 
                                color="error"
                                onClick={() => {
                                  // Could handle booking cancellation
                                  console.log('Cancel booking:', booking.id);
                                }}
                              >
                                Cancel
                              </Button>
                            )}
                          </Box>
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

      {/* Profile Picture Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={handleImageCancel} maxWidth="sm" fullWidth>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
            {/* Current/Preview Image */}
            <Avatar
              sx={{ 
                width: 200, 
                height: 200, 
                border: '4px solid #e0e0e0',
                fontSize: '4rem'
              }}
              src={imagePreview || user?.profilePicture}
            >
              {!imagePreview && !user?.profilePicture && getInitials(user?.firstName, user?.lastName, user?.username)}
            </Avatar>
            
            {/* Upload Button */}
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture-upload"
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="profile-picture-upload">
              <Button
                variant="contained"
                component="span"
                startIcon={<PhotoCameraIcon />}
                sx={{ mr: 2 }}
              >
                Choose Image
              </Button>
            </label>
            
            {/* Remove Picture Button */}
            {user?.profilePicture && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleRemoveProfilePicture}
              >
                Remove Current Picture
              </Button>
            )}
            
            {/* Image Guidelines */}
            <Typography variant="caption" color="textSecondary" textAlign="center">
              Supported formats: JPG, PNG, GIF<br/>
              Maximum size: 5MB<br/>
              Recommended: Square image, 300x300px or larger
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleImageCancel}>Cancel</Button>
          {imagePreview && (
            <Button onClick={handleImageSave} variant="contained">
              Save Picture
            </Button>
          )}
        </DialogActions>
      </Dialog>

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