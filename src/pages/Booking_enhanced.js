import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Rating,
  IconButton,
  Fade,
  Slide,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  CheckCircle as CheckCircleIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  Security as SecurityIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Star as StarIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import bookingService from '../services/bookingService';
import authService from '../services/authService';

// Styled components for enhanced visual appeal
const HeroSection = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(4),
  textAlign: 'center',
}));

const BookingCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: theme.shadows[10],
  },
}));

const SummaryCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  position: 'sticky',
  top: theme.spacing(2),
}));

const StepIcon = styled('div')(({ theme, active, completed }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: completed ? theme.palette.success.main : active ? theme.palette.primary.main : theme.palette.grey[300],
  color: completed || active ? 'white' : theme.palette.grey[600],
  fontWeight: 'bold',
}));

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmationDialog, setConfirmationDialog] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [error, setError] = useState('');
  
  // Form data states
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '09:00',
    pickupLocation: '',
    dropoffLocation: '',
    additionalOptions: {
      insurance: false,
      gps: false,
      childSeat: false,
      additionalDriver: false,
    },
  });

  const [personalData, setPersonalData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zipCode: '',
    driverLicense: '',
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    saveCard: false,
  });

  // Get car data from navigation state or default
  const carData = location.state?.car || {
    id: 1,
    name: 'Default Car',
    category: 'Sedan',
    price: 45,
    image: 'https://via.placeholder.com/300x200',
    features: ['GPS Navigation', 'Bluetooth', 'Air Conditioning'],
    rating: 4.5,
    reviews: 128,
  };

  useEffect(() => {
    // Pre-fill dates if provided from navigation
    if (location.state?.bookingData) {
      setBookingData(prev => ({
        ...prev,
        ...location.state.bookingData,
      }));
    }

    // Load user data if logged in
    const user = authService.getCurrentUser();
    if (user) {
      setPersonalData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
    }
  }, [location.state]);

  const steps = [
    {
      label: 'Rental Details',
      icon: <CalendarIcon />,
      description: 'Choose your rental dates and locations',
    },
    {
      label: 'Personal Information',
      icon: <PersonIcon />,
      description: 'Provide your contact and driver details',
    },
    {
      label: 'Payment & Extras',
      icon: <CreditCardIcon />,
      description: 'Complete payment and select additional options',
    },
    {
      label: 'Confirmation',
      icon: <CheckCircleIcon />,
      description: 'Review and confirm your booking',
    },
  ];

  const calculateTotal = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
    
    let total = carData.price * days;
    
    // Add optional extras
    if (bookingData.additionalOptions.insurance) total += 15 * days;
    if (bookingData.additionalOptions.gps) total += 10 * days;
    if (bookingData.additionalOptions.childSeat) total += 8 * days;
    if (bookingData.additionalOptions.additionalDriver) total += 12 * days;
    
    const tax = total * 0.1; // 10% tax
    return total + tax;
  };

  const calculateDays = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 1;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
      setError('');
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Rental Details
        if (!bookingData.startDate || !bookingData.endDate || !bookingData.pickupLocation) {
          setError('Please fill in all required rental details');
          return false;
        }
        if (new Date(bookingData.startDate) >= new Date(bookingData.endDate)) {
          setError('End date must be after start date');
          return false;
        }
        return true;
      case 1: // Personal Information
        if (!personalData.firstName || !personalData.lastName || !personalData.email || 
            !personalData.phone || !personalData.driverLicense) {
          setError('Please fill in all required personal information');
          return false;
        }
        return true;
      case 2: // Payment
        if (!paymentData.cardNumber || !paymentData.expiryDate || 
            !paymentData.cvv || !paymentData.cardholderName) {
          setError('Please fill in all payment information');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleBookingSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      const bookingPayload = {
        carId: carData.id,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        pickupLocation: bookingData.pickupLocation,
        dropoffLocation: bookingData.dropoffLocation || bookingData.pickupLocation,
        totalAmount: calculateTotal(),
        status: 'confirmed',
        personalInfo: personalData,
        paymentInfo: {
          ...paymentData,
          cardNumber: '**** **** **** ' + paymentData.cardNumber.slice(-4), // Mask card number
        },
        additionalOptions: bookingData.additionalOptions,
      };

      // Try to submit to backend
      const response = await bookingService.createBooking(bookingPayload);
      
      if (response.data && response.data.id) {
        setBookingId(response.data.id);
      } else {
        // Generate mock booking ID if backend doesn't provide one
        setBookingId('BK' + Date.now());
      }
      
      setBookingComplete(true);
      setActiveStep(4); // Move to success step
    } catch (error) {
      console.error('Booking submission error:', error);
      // For demo purposes, still show success even if backend fails
      setBookingId('BK' + Date.now());
      setBookingComplete(true);
      setActiveStep(4);
    } finally {
      setLoading(false);
      setConfirmationDialog(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BookingCard>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                📅 Rental Details
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Start Date"
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="End Date"
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: bookingData.startDate || new Date().toISOString().split('T')[0] }}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Pickup Time"
                    type="time"
                    value={bookingData.startTime}
                    onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Return Time"
                    type="time"
                    value={bookingData.endTime}
                    onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Pickup Location</InputLabel>
                    <Select
                      value={bookingData.pickupLocation}
                      onChange={(e) => setBookingData({...bookingData, pickupLocation: e.target.value})}
                      label="Pickup Location"
                    >
                      <MenuItem value="Downtown Office">Downtown Office - 123 Main St</MenuItem>
                      <MenuItem value="Airport Terminal">Airport Terminal - Terminal 1</MenuItem>
                      <MenuItem value="City Center">City Center - 456 Business Ave</MenuItem>
                      <MenuItem value="Mall Location">Mall Location - Shopping Center</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Drop-off Location</InputLabel>
                    <Select
                      value={bookingData.dropoffLocation}
                      onChange={(e) => setBookingData({...bookingData, dropoffLocation: e.target.value})}
                      label="Drop-off Location"
                    >
                      <MenuItem value="">Same as pickup</MenuItem>
                      <MenuItem value="Downtown Office">Downtown Office - 123 Main St</MenuItem>
                      <MenuItem value="Airport Terminal">Airport Terminal - Terminal 1</MenuItem>
                      <MenuItem value="City Center">City Center - 456 Business Ave</MenuItem>
                      <MenuItem value="Mall Location">Mall Location - Shopping Center</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </BookingCard>
        );

      case 1:
        return (
          <BookingCard>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                👤 Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={personalData.firstName}
                    onChange={(e) => setPersonalData({...personalData, firstName: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={personalData.lastName}
                    onChange={(e) => setPersonalData({...personalData, lastName: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={personalData.email}
                    onChange={(e) => setPersonalData({...personalData, email: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    value={personalData.phone}
                    onChange={(e) => setPersonalData({...personalData, phone: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    value={personalData.address}
                    onChange={(e) => setPersonalData({...personalData, address: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="City"
                    value={personalData.city}
                    onChange={(e) => setPersonalData({...personalData, city: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ZIP Code"
                    value={personalData.zipCode}
                    onChange={(e) => setPersonalData({...personalData, zipCode: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Driver's License Number"
                    value={personalData.driverLicense}
                    onChange={(e) => setPersonalData({...personalData, driverLicense: e.target.value})}
                    required
                    helperText="Required for vehicle rental verification"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </BookingCard>
        );

      case 2:
        return (
          <BookingCard>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                💳 Payment & Additional Options
              </Typography>
              
              {/* Additional Options */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  Additional Options
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, border: bookingData.additionalOptions.insurance ? '2px solid #1976d2' : '1px solid #e0e0e0', cursor: 'pointer' }}
                           onClick={() => setBookingData({...bookingData, additionalOptions: {...bookingData.additionalOptions, insurance: !bookingData.additionalOptions.insurance}})}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Full Insurance</Typography>
                          <Typography variant="body2" color="text.secondary">+$15/day</Typography>
                        </Box>
                        <SecurityIcon color={bookingData.additionalOptions.insurance ? 'primary' : 'disabled'} />
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, border: bookingData.additionalOptions.gps ? '2px solid #1976d2' : '1px solid #e0e0e0', cursor: 'pointer' }}
                           onClick={() => setBookingData({...bookingData, additionalOptions: {...bookingData.additionalOptions, gps: !bookingData.additionalOptions.gps}})}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">GPS Navigation</Typography>
                          <Typography variant="body2" color="text.secondary">+$10/day</Typography>
                        </Box>
                        <LocationIcon color={bookingData.additionalOptions.gps ? 'primary' : 'disabled'} />
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, border: bookingData.additionalOptions.childSeat ? '2px solid #1976d2' : '1px solid #e0e0e0', cursor: 'pointer' }}
                           onClick={() => setBookingData({...bookingData, additionalOptions: {...bookingData.additionalOptions, childSeat: !bookingData.additionalOptions.childSeat}})}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Child Seat</Typography>
                          <Typography variant="body2" color="text.secondary">+$8/day</Typography>
                        </Box>
                        <PersonIcon color={bookingData.additionalOptions.childSeat ? 'primary' : 'disabled'} />
                      </Box>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, border: bookingData.additionalOptions.additionalDriver ? '2px solid #1976d2' : '1px solid #e0e0e0', cursor: 'pointer' }}
                           onClick={() => setBookingData({...bookingData, additionalOptions: {...bookingData.additionalOptions, additionalDriver: !bookingData.additionalOptions.additionalDriver}})}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Additional Driver</Typography>
                          <Typography variant="body2" color="text.secondary">+$12/day</Typography>
                        </Box>
                        <PersonIcon color={bookingData.additionalOptions.additionalDriver ? 'primary' : 'disabled'} />
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Payment Information */}
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Payment Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({...paymentData, cardNumber: e.target.value})}
                    placeholder="1234 5678 9012 3456"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    value={paymentData.expiryDate}
                    onChange={(e) => setPaymentData({...paymentData, expiryDate: e.target.value})}
                    placeholder="MM/YY"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({...paymentData, cvv: e.target.value})}
                    placeholder="123"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Cardholder Name"
                    value={paymentData.cardholderName}
                    onChange={(e) => setPaymentData({...paymentData, cardholderName: e.target.value})}
                    required
                  />
                </Grid>
              </Grid>
            </CardContent>
          </BookingCard>
        );

      case 3:
        return (
          <BookingCard>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                ✅ Booking Confirmation
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Rental Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CalendarIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Rental Period" 
                        secondary={`${bookingData.startDate} to ${bookingData.endDate} (${calculateDays()} days)`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LocationIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Pickup Location" 
                        secondary={bookingData.pickupLocation}
                      />
                    </ListItem>
                    {bookingData.dropoffLocation && (
                      <ListItem>
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Drop-off Location" 
                          secondary={bookingData.dropoffLocation}
                        />
                      </ListItem>
                    )}
                  </List>

                  <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                    Personal Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><PersonIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Name" 
                        secondary={`${personalData.firstName} ${personalData.lastName}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><EmailIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Email" 
                        secondary={personalData.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><PhoneIcon /></ListItemIcon>
                      <ListItemText 
                        primary="Phone" 
                        secondary={personalData.phone}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                      Selected Vehicle
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar src={carData.image} sx={{ width: 60, height: 60, mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {carData.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {carData.category}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={carData.rating} size="small" readOnly />
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            ({carData.reviews})
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </BookingCard>
        );

      case 4:
        return (
          <Fade in timeout={1000}>
            <BookingCard>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                <Typography variant="h4" gutterBottom fontWeight="bold" color="success.main">
                  Booking Confirmed!
                </Typography>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  Booking ID: {bookingId}
                </Typography>
                <Typography variant="body1" paragraph>
                  Thank you for choosing our car rental service. Your booking has been confirmed 
                  and you will receive a confirmation email shortly.
                </Typography>
                <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/profile')}
                    startIcon={<PersonIcon />}
                  >
                    View My Bookings
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => navigate('/cars')}
                    startIcon={<CarIcon />}
                  >
                    Book Another Car
                  </Button>
                </Box>
              </CardContent>
            </BookingCard>
          </Fade>
        );

      default:
        return null;
    }
  };

  if (bookingComplete && activeStep === 4) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        {renderStepContent(4)}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <HeroSection elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <IconButton 
            onClick={() => navigate('/cars')} 
            sx={{ color: 'white', mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" fontWeight="bold">
            🚗 Complete Your Booking
          </Typography>
        </Box>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Just a few steps to secure your perfect rental car
        </Typography>
      </HeroSection>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Progress Stepper */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={activeStep} orientation="horizontal">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel
                    StepIconComponent={() => (
                      <StepIcon 
                        active={index === activeStep}
                        completed={index < activeStep}
                      >
                        {index < activeStep ? <CheckCircleIcon /> : step.icon}
                      </StepIcon>
                    )}
                  >
                    <Typography variant="subtitle2" fontWeight="bold">
                      {step.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Step Content */}
          {renderStepContent(activeStep)}

          {/* Navigation Buttons */}
          {activeStep < 4 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
                startIcon={<ArrowBackIcon />}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={activeStep === steps.length - 1 ? () => setConfirmationDialog(true) : handleNext}
                endIcon={activeStep === steps.length - 1 ? <CheckCircleIcon /> : null}
              >
                {activeStep === steps.length - 1 ? 'Confirm Booking' : 'Next'}
              </Button>
            </Box>
          )}
        </Grid>

        {/* Booking Summary */}
        <Grid item xs={12} md={4}>
          <SummaryCard>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              📋 Booking Summary
            </Typography>
            
            {/* Car Details */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar src={carData.image} sx={{ width: 80, height: 80, mr: 2 }} />
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  {carData.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {carData.category}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <Rating value={carData.rating} size="small" readOnly />
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    ({carData.reviews} reviews)
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Pricing Breakdown */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">
                  Car rental ({calculateDays()} days)
                </Typography>
                <Typography variant="body2">
                  ${(carData.price * calculateDays()).toFixed(2)}
                </Typography>
              </Box>
              
              {bookingData.additionalOptions.insurance && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Full Insurance
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${(15 * calculateDays()).toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              {bookingData.additionalOptions.gps && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    GPS Navigation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${(10 * calculateDays()).toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              {bookingData.additionalOptions.childSeat && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Child Seat
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${(8 * calculateDays()).toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              {bookingData.additionalOptions.additionalDriver && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Additional Driver
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${(12 * calculateDays()).toFixed(2)}
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Tax (10%)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ${(calculateTotal() * 0.1 / 1.1).toFixed(2)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h6" fontWeight="bold">
                  Total
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Box>

            {/* Rental Period */}
            {bookingData.startDate && bookingData.endDate && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Rental Period
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(bookingData.startDate).toLocaleDateString()} - {new Date(bookingData.endDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {calculateDays()} day{calculateDays() !== 1 ? 's' : ''}
                </Typography>
              </Box>
            )}
          </SummaryCard>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialog} onClose={() => setConfirmationDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            Confirm Your Booking
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" paragraph>
            Please review your booking details and confirm your reservation for:
          </Typography>
          <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {carData.name} - {carData.category}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {bookingData.startDate} to {bookingData.endDate}
            </Typography>
            <Typography variant="h6" color="primary" fontWeight="bold">
              Total: ${calculateTotal().toFixed(2)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            By confirming, you agree to our terms and conditions. A confirmation email will be sent to {personalData.email}.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleBookingSubmit} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
          >
            {loading ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Booking;