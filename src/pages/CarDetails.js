import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Alert,
  Skeleton,
  Rating,
  IconButton,
  Tab,
  Tabs,
  Stack,
  Avatar,
  LinearProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useParams, useNavigate } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import PeopleIcon from '@mui/icons-material/People';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SpeedIcon from '@mui/icons-material/Speed';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SecurityIcon from '@mui/icons-material/Security';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import carService from '../services/carService';

// Styled components
const HeroImage = styled(CardMedia)(({ theme }) => ({
  height: 500,
  position: 'relative',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
}));

const PriceCard = styled(Card)(({ theme }) => ({
  position: 'sticky',
  top: theme.spacing(2),
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '& .MuiButton-root': {
    marginTop: theme.spacing(2),
  },
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
}));

const SpecCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const CarDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    notes: '',
  });

  useEffect(() => {
    fetchCarDetails();
  }, [id]);

  const fetchCarDetails = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🚗 Fetching car details for ID:', id);
      
      const response = await carService.getCarById(id);
      console.log('🚗 Car details response:', response);
      
      if (response.data) {
        setCar(response.data);
        console.log('✅ Car details loaded successfully');
      } else {
        throw new Error('No car data received');
      }
    } catch (error) {
      console.error('❌ Error fetching car details:', error);
      setError('Unable to load car details. Please try again.');
      
      // Fallback to mock data for development
      setCar(createMockCarData(id));
    } finally {
      setLoading(false);
    }
  };

  const createMockCarData = (carId) => ({
    id: carId,
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    pricePerDay: 75.0,
    available: true,
    description: 'A reliable and comfortable sedan perfect for business trips and family outings. This vehicle offers excellent fuel economy, spacious interior, and modern safety features.',
    category: 'Sedan',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    seats: 5,
    color: 'Silver',
    licensePlate: 'TOY-CAM-252',
    imageUrl: 'https://example.com/images/toyota-camry.jpg',
    location: 'Downtown',
    mileage: 15000.0,
    features: 'AC,GPS,Bluetooth,Cruise Control'
  });

  const parseFeatures = (featuresString) => {
    if (!featuresString) return [];
    return featuresString.split(',').map(f => f.trim());
  };

  const getFeatureIcon = (feature) => {
    const icons = {
      'AC': <AcUnitIcon />,
      'GPS': <GpsFixedIcon />,
      'Bluetooth': <BluetoothIcon />,
      'Cruise Control': <DriveEtaIcon />,
      'Lane Assist': <SecurityIcon />,
      'Leather Seats': <StarIcon />,
      'Sunroof': <StarIcon />,
      'Autopilot': <SecurityIcon />,
      'Supercharging': <LocalGasStationIcon />,
      'Third Row Seating': <PeopleIcon />,
      '4WD': <DriveEtaIcon />,
      'Removable Doors': <StarIcon />,
      'Premium Interior': <StarIcon />,
      'Heated Seats': <AcUnitIcon />,
    };
    return icons[feature] || <CheckIcon />;
  };

  const handleBookingClick = () => {
    setBookingDialogOpen(true);
  };

  const handleBookingSubmit = () => {
    navigate('/booking', {
      state: {
        car,
        bookingData,
      },
    });
  };

  const handleInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateTotalPrice = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return days > 0 ? days * car.pricePerDay : 0;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={500} sx={{ mb: 3, borderRadius: 2 }} />
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={60} />
            <Skeleton variant="text" height={200} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (!car) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Car not found. Please check the car ID and try again.
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/cars')}
        >
          Back to Cars
        </Button>
      </Container>
    );
  }

  const features = parseFeatures(car.features);
  const carName = car.name || `${car.make} ${car.model}`;
  const totalPrice = calculateTotalPrice();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/cars')}
          sx={{ mr: 2 }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {carName} ({car.year})
        </Typography>
        <IconButton>
          <ShareIcon />
        </IconButton>
        <IconButton>
          <FavoriteIcon />
        </IconButton>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Car Image */}
          <HeroImage
            image={car.imageUrl || 'https://via.placeholder.com/600x400?text=Car+Image'}
            title={carName}
          />

          {/* Tabs for different sections */}
          <Box sx={{ mt: 3 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Overview" />
              <Tab label="Features" />
              <Tab label="Specifications" />
              <Tab label="Location" />
            </Tabs>

            {/* Tab Content */}
            <Box sx={{ mt: 3 }}>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    About This Car
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {car.description}
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6} sm={3}>
                      <SpecCard>
                        <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6">{car.seats}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Seats
                        </Typography>
                      </SpecCard>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <SpecCard>
                        <LocalGasStationIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6">{car.fuelType}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Fuel Type
                        </Typography>
                      </SpecCard>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <SpecCard>
                        <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6">{car.transmission}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Transmission
                        </Typography>
                      </SpecCard>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <SpecCard>
                        <DriveEtaIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h6">{car.mileage?.toLocaleString() || 'N/A'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mileage
                        </Typography>
                      </SpecCard>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Features & Amenities
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    {features.length > 0 ? (
                      features.map((feature, index) => (
                        <FeatureChip
                          key={index}
                          icon={getFeatureIcon(feature)}
                          label={feature}
                          variant="outlined"
                        />
                      ))
                    ) : (
                      <Typography color="text.secondary">
                        No specific features listed
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              {tabValue === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Specifications
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Vehicle Details
                        </Typography>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Make:</Typography>
                            <Typography variant="body2" fontWeight="bold">{car.make}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Model:</Typography>
                            <Typography variant="body2" fontWeight="bold">{car.model}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Year:</Typography>
                            <Typography variant="body2" fontWeight="bold">{car.year}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Color:</Typography>
                            <Typography variant="body2" fontWeight="bold">{car.color}</Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Registration
                        </Typography>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">License Plate:</Typography>
                            <Typography variant="body2" fontWeight="bold">{car.licensePlate}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2">Category:</Typography>
                            <Typography variant="body2" fontWeight="bold">{car.category}</Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {tabValue === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Pickup Location
                  </Typography>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <LocationOnIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      {car.location}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Vehicle available for pickup at this location
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Booking Sidebar */}
        <Grid item xs={12} md={4}>
          <PriceCard>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" component="span">
                ${car.pricePerDay}
              </Typography>
              <Typography variant="h6" component="span" sx={{ ml: 1, opacity: 0.8 }}>
                /day
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Chip 
                label={car.category} 
                color="secondary" 
                variant="filled"
                size="small"
              />
              <Chip 
                label={car.available ? 'Available' : 'Not Available'} 
                color={car.available ? 'success' : 'error'}
                size="small"
              />
            </Box>

            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.3)' }} />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleBookingClick}
              disabled={!car.available}
              sx={{ 
                backgroundColor: 'white', 
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100'
                }
              }}
            >
              {car.available ? 'Book This Car' : 'Not Available'}
            </Button>

            <Typography variant="body2" sx={{ mt: 2, opacity: 0.8, textAlign: 'center' }}>
              Free cancellation up to 24 hours before pickup
            </Typography>
          </PriceCard>

          {/* Customer Reviews */}
          <Card sx={{ mt: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Customer Rating
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={4.5} readOnly precision={0.5} />
              <Typography variant="body2" sx={{ ml: 1 }}>
                4.5 (128 reviews)
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={90} sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              90% of customers recommend this car
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Enhanced Booking Dialog */}
      <Dialog 
        open={bookingDialogOpen} 
        onClose={() => setBookingDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CalendarTodayIcon sx={{ mr: 1 }} />
            Book {carName}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pickup Date"
                name="startDate"
                type="date"
                value={bookingData.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
                helperText="When would you like to pick up the car?"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Return Date"
                name="endDate"
                type="date"
                value={bookingData.endDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
                required
                helperText="When will you return the car?"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Special Requests"
                name="notes"
                multiline
                rows={3}
                value={bookingData.notes}
                onChange={handleInputChange}
                placeholder="Any special requirements, pickup instructions, or questions..."
              />
            </Grid>
            {totalPrice > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 2, backgroundColor: 'primary.light', color: 'primary.contrastText' }}>
                  <Typography variant="h6" gutterBottom>
                    Booking Summary
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Daily Rate:</Typography>
                    <Typography>${car.pricePerDay}/day</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Duration:</Typography>
                    <Typography>{Math.ceil((new Date(bookingData.endDate) - new Date(bookingData.startDate)) / (1000 * 60 * 60 * 24))} days</Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: 'rgba(255,255,255,0.3)' }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">${totalPrice}</Typography>
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setBookingDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBookingSubmit} 
            variant="contained"
            disabled={!bookingData.startDate || !bookingData.endDate}
            startIcon={<AttachMoneyIcon />}
          >
            Continue to Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CarDetails;