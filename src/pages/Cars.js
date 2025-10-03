import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Paper,
  IconButton,
  Rating,
  Skeleton,
  Alert,
  InputAdornment,
  Fade,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  LocalGasStation as LocalGasStationIcon,
  Speed as SpeedIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  DriveEta as DriveEtaIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import carService from '../services/carService';

// Enhanced mock data with more realistic information
const enhancedMockCars = [
  {
    id: 1,
    name: 'Toyota Camry',
    category: 'Sedan',
    price: 45,
    location: 'Downtown',
    seats: 5,
    available: true,
    rating: 4.5,
    imageUrl: 'https://example.com/camry.jpg',
    features: ['GPS', 'AC', 'Bluetooth']
  },
  {
    id: 2,
    name: 'Honda Civic',
    category: 'Sedan',
    price: 40,
    location: 'Airport',
    seats: 5,
    available: true,
    rating: 4.3,
    imageUrl: 'https://example.com/civic.jpg',
    features: ['GPS', 'AC', 'Backup Camera']
  },
  {
    id: 3,
    name: 'BMW X5',
    category: 'SUV',
    price: 85,
    location: 'Downtown',
    seats: 7,
    available: true,
    rating: 4.8,
    imageUrl: 'https://example.com/bmw-x5.jpg',
    features: ['GPS', 'AC', 'Leather Seats', 'Sunroof']
  }
];

// Styled components for enhanced visual appeal
const HeroSection = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: theme.spacing(6, 4),
  borderRadius: theme.spacing(3),
  marginBottom: theme.spacing(4),
  textAlign: 'center',
}));

const FilterSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  borderRadius: theme.spacing(2),
  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
}));

const CarCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[20],
  },
}));

const CarImage = styled(CardMedia)(({ theme }) => ({
  height: 220,
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const PriceChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: theme.palette.success.main,
  color: 'white',
  fontWeight: 'bold',
  fontSize: '1rem',
}));

const StatusChip = styled(Chip)(({ available }) => ({
  position: 'absolute',
  top: 8,
  left: 8,
  backgroundColor: available ? '#4caf50' : '#f44336',
  color: 'white',
  fontWeight: 'bold',
}));

const Cars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    priceRange: '',
    searchTerm: '',
  });
  const [sortBy, setSortBy] = useState('name');

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🚗 Fetching cars from database...');
      
      const response = await carService.getAllCars();
      console.log('🚗 Cars API response:', response);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`✅ Found ${response.data.length} cars in database`);
        setCars(response.data);
        setError(''); // Clear any previous errors
      } else if (response.data && Array.isArray(response.data) && response.data.length === 0) {
        console.log('⚠️ Database is empty, using sample cars');
        setError('No cars found in database. Showing sample cars.');
        setCars(enhancedMockCars);
      } else {
        console.log('⚠️ Invalid response format, using sample cars');
        setError('Invalid response from database. Showing sample cars.');
        setCars(enhancedMockCars);
      }
    } catch (error) {
      console.error('❌ Error fetching cars:', error);
      
      let errorMessage = 'Unable to connect to database. ';
      if (!error.response) {
        errorMessage += 'Please ensure your Spring Boot backend is running on http://localhost:8081';
      } else if (error.response.status === 401) {
        errorMessage += 'Authentication required. Please login to view cars.';
      } else if (error.response.status === 404) {
        errorMessage += 'Cars endpoint not found. Check your backend configuration.';
      } else {
        errorMessage += `Server error (${error.response.status}). `;
      }
      errorMessage += ' Showing sample cars.';
      
      setError(errorMessage);
      setCars(enhancedMockCars);
    } finally {
      setLoading(false);
    }
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...cars];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(car => {
        const name = car.name || car.make + ' ' + car.model || '';
        const category = car.category || '';
        return name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
               category.toLowerCase().includes(filters.searchTerm.toLowerCase());
      });
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(car => 
        car.location && car.location.toLowerCase() === filters.location.toLowerCase()
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(car => 
        car.category && car.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Price range filter
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      filtered = filtered.filter(car => {
        const price = car.price || car.pricePerDay || car.price_per_day || 0;
        return price >= min && (max ? price <= max : true);
      });
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          const aPriceL = a.price || a.pricePerDay || a.price_per_day || 0;
          const bPriceL = b.price || b.pricePerDay || b.price_per_day || 0;
          return aPriceL - bPriceL;
        case 'price-high':
          const aPriceH = a.price || a.pricePerDay || a.price_per_day || 0;
          const bPriceH = b.price || b.pricePerDay || b.price_per_day || 0;
          return bPriceH - aPriceH;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
        default:
          const aName = a.name || (a.make && a.model ? `${a.make} ${a.model}` : 'Unknown');
          const bName = b.name || (b.make && b.model ? `${b.make} ${b.model}` : 'Unknown');
          return aName.localeCompare(bName);
      }
    });

    setFilteredCars(filtered);
  }, [cars, filters, sortBy]); // Add dependencies for useCallback

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters, cars, filters, sortBy]);

  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value,
    });
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const handleCarSelect = (carId) => {
    navigate(`/cars/${carId}`);
  };

  const handleBookNow = (car) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    navigate('/booking', {
      state: {
        car: car,
        bookingData: {
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        }
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      category: '',
      priceRange: '',
      searchTerm: '',
    });
    setSortBy('name');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <HeroSection elevation={3}>
          <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 2 }} />
          <Skeleton variant="text" width="80%" height={30} sx={{ mx: 'auto' }} />
        </HeroSection>
        <FilterSection elevation={2}>
          <Skeleton variant="rectangular" height={120} />
        </FilterSection>
        <Grid container spacing={3}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Fade in timeout={1000}>
        <HeroSection elevation={3}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            🚗 Premium Car Rental
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600, mx: 'auto' }}>
            Choose from our extensive fleet of well-maintained vehicles. 
            From economy to luxury, we have the perfect car for your journey.
          </Typography>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Chip 
              icon={<CheckCircleIcon />} 
              label="24/7 Support" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              icon={<DriveEtaIcon />} 
              label="Free Delivery" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
            <Chip 
              icon={<AttachMoneyIcon />} 
              label="Best Prices" 
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} 
            />
          </Box>
        </HeroSection>
      </Fade>

      {/* Error Alert */}
      {error && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filter Section */}
      <FilterSection elevation={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterListIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight="bold">
            Find Your Perfect Car
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button variant="outlined" onClick={clearFilters} size="small">
            Clear Filters
          </Button>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search Cars"
              name="searchTerm"
              value={filters.searchTerm}
              onChange={handleFilterChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
                label="Location"
              >
                <MenuItem value="">All Locations</MenuItem>
                <MenuItem value="downtown">Downtown</MenuItem>
                <MenuItem value="airport">Airport</MenuItem>
                <MenuItem value="city center">City Center</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="sedan">Sedan</MenuItem>
                <MenuItem value="suv">SUV</MenuItem>
                <MenuItem value="luxury">Luxury</MenuItem>
                <MenuItem value="economy">Economy</MenuItem>
                <MenuItem value="electric">Electric</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Price Range</InputLabel>
              <Select
                name="priceRange"
                value={filters.priceRange}
                onChange={handleFilterChange}
                label="Price Range"
              >
                <MenuItem value="">All Prices</MenuItem>
                <MenuItem value="0-40">$0 - $40</MenuItem>
                <MenuItem value="40-60">$40 - $60</MenuItem>
                <MenuItem value="60-80">$60 - $80</MenuItem>
                <MenuItem value="80-">$80+</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                label="Sort By"
              >
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="price-low">Price (Low to High)</MenuItem>
                <MenuItem value="price-high">Price (High to Low)</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </FilterSection>

      {/* Results Summary */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          {filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''} available
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {Object.values(filters).some(v => v) && (
            <Chip 
              label="Filters Applied" 
              color="primary" 
              size="small" 
              onDelete={clearFilters}
            />
          )}
        </Box>
      </Box>

      {/* Cars Grid */}
      {filteredCars.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No cars found matching your criteria
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Try adjusting your filters or search terms
          </Typography>
          <Button variant="contained" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredCars.map((car, index) => (
            <Grid item xs={12} sm={6} md={4} key={car.id}>
              <Zoom in timeout={300 + index * 100}>
                <CarCard elevation={3}>
                  <Box sx={{ position: 'relative' }}>
                    <CarImage
                      image={car.imageUrl || 'https://via.placeholder.com/300x200?text=Car+Image'}
                      title={car.name || `${car.make} ${car.model}`}
                    />
                    <StatusChip
                      label={car.available || car.is_available ? 'Available' : 'Rented'}
                      available={car.available || car.is_available}
                      size="small"
                    />
                    <PriceChip
                      label={`$${car.pricePerDay || car.price || car.price_per_day}/day`}
                      size="medium"
                    />
                    {car.status && (
                      <Chip
                        label={car.status}
                        size="small"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8,
                          backgroundColor: car.status === 'Active' ? '#2196f3' : 
                                         car.status === 'Maintenance' ? '#ff9800' : 
                                         car.status === 'Booked' ? '#f44336' : '#9e9e9e',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Box>
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {car.name || `${car.make} ${car.model} (${car.year})`}
                      </Typography>
                      <IconButton size="small" sx={{ color: 'text.secondary' }}>
                        <FavoriteIcon />
                      </IconButton>
                    </Box>
                    
                    <Chip 
                      label={car.category} 
                      color="primary" 
                      size="small" 
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {car.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Rating value={car.rating || 0} readOnly size="small" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                        ({car.reviews || 0} reviews)
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={1} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {car.seats} seats
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocalGasStationIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {car.fuelType || car.fuel}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SpeedIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {car.mileage}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOnIcon fontSize="small" color="action" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {car.location}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleCarSelect(car.id)}
                        sx={{ flex: 1 }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleBookNow(car)}
                        disabled={!car.available}
                        sx={{ flex: 1 }}
                      >
                        {car.available ? 'Book Now' : 'Unavailable'}
                      </Button>
                    </Box>
                  </CardContent>
                </CarCard>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Cars;