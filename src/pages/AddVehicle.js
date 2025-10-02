import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Paper,
  Chip,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  DirectionsCar as CarIcon,
  AttachMoney as MoneyIcon,
  LocationOn as LocationIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import carService from '../services/carService';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  marginBottom: theme.spacing(3),
}));

const SectionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  border: `2px solid ${theme.palette.primary.light}`,
}));

const PreviewCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(45deg, #f5f7fa 0%, #c3cfe2 100%)',
}));

const AddVehicle = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    // Basic Information (MySQL fields)
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    licensePlate: '',
    
    // Category & Specs
    category: '',
    seats: '',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    mileage: '',
    
    // Pricing & Availability (MySQL fields: price_per_day, is_available, available, status)
    pricePerDay: '',
    location: '',
    available: true,           // MySQL 'available' field
    isAvailable: true,         // MySQL 'is_available' field
    status: 'Active',          // MySQL 'status' field
    
    // Features & Description
    features: '',
    description: '',
    imageUrl: '',
  });

  const categories = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Economy', 'Sports', 'Electric'];
  const locations = ['Downtown', 'Airport', 'City Center', 'Business District', 'Suburban', 'Mall Complex'];
  const transmissions = ['Automatic', 'Manual'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
  const seatOptions = [2, 4, 5, 7, 8];
  const statusOptions = ['Active', 'Inactive', 'Maintenance', 'Booked'];

  const steps = [
    {
      label: 'Basic Information',
      description: 'Enter vehicle make, model, and identification details',
    },
    {
      label: 'Specifications',
      description: 'Configure vehicle category, engine, and capacity details',
    },
    {
      label: 'Pricing & Location',
      description: 'Set rental price and pickup location',
    },
    {
      label: 'Features & Media',
      description: 'Add vehicle features, description, and images',
    },
    {
      label: 'Review & Submit',
      description: 'Review all details and submit to database',
    },
  ];

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.make && formData.model && formData.year && formData.color;
      case 1:
        return formData.category && formData.seats && formData.transmission && formData.fuelType;
      case 2:
        return formData.pricePerDay && formData.location;
      case 3:
        return formData.description;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare car data for MySQL backend (matching exact database schema)
      const carData = {
        // Core MySQL fields (from phpMyAdmin car_rental_db.car table)
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        price_per_day: parseFloat(formData.pricePerDay),  // MySQL field name
        available: formData.available,                    // MySQL boolean field
        is_available: formData.isAvailable,              // MySQL boolean field  
        status: formData.status,                         // MySQL status field
        
        // Additional fields for enhanced functionality
        seats: parseInt(formData.seats),
        category: formData.category,
        location: formData.location,
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        description: formData.description,
        imageUrl: formData.imageUrl,
        color: formData.color,
        licensePlate: formData.licensePlate,
        mileage: parseFloat(formData.mileage) || 0,
        features: formData.features,
        
        // For backward compatibility, include both naming conventions
        pricePerDay: parseFloat(formData.pricePerDay),
        isAvailable: formData.isAvailable,
      };

      console.log('🚗 Submitting car data to MySQL database:', carData);
      console.log('📊 MySQL Schema Mapping:', {
        'price_per_day': carData.price_per_day,
        'is_available': carData.is_available,
        'available': carData.available,
        'status': carData.status
      });
      
      const response = await carService.createCar(carData);
      console.log('✅ Car created successfully in MySQL:', response);
      
      showSnackbar('Vehicle added successfully to MySQL database!');
      
      // Navigate back to admin cars page after success
      setTimeout(() => {
        navigate('/admin/cars');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error saving car to MySQL:', error);
      showSnackbar('Failed to add vehicle to database. Please check your data and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <SectionCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CarIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Vehicle Identification</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="make"
                    label="Make"
                    value={formData.make}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="e.g., Toyota, Honda, BMW"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="model"
                    label="Model"
                    value={formData.model}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="e.g., Camry, Accord, X5"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="year"
                    label="Year"
                    type="number"
                    value={formData.year}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    inputProps={{ min: 1900, max: new Date().getFullYear() + 1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="color"
                    label="Color"
                    value={formData.color}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    placeholder="e.g., Silver, Black, White"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="licensePlate"
                    label="License Plate"
                    value={formData.licensePlate}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="e.g., ABC-123 (optional)"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        );

      case 1:
        return (
          <SectionCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BuildIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Vehicle Specifications</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Seats</InputLabel>
                    <Select
                      name="seats"
                      value={formData.seats}
                      onChange={handleInputChange}
                      label="Seats"
                    >
                      {seatOptions.map((seat) => (
                        <MenuItem key={seat} value={seat}>
                          {seat} Seats
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Transmission</InputLabel>
                    <Select
                      name="transmission"
                      value={formData.transmission}
                      onChange={handleInputChange}
                      label="Transmission"
                    >
                      {transmissions.map((transmission) => (
                        <MenuItem key={transmission} value={transmission}>
                          {transmission}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Fuel Type</InputLabel>
                    <Select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                      label="Fuel Type"
                    >
                      {fuelTypes.map((fuelType) => (
                        <MenuItem key={fuelType} value={fuelType}>
                          {fuelType}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="mileage"
                    label="Current Mileage"
                    type="number"
                    value={formData.mileage}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Current odometer reading (optional)"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">km</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        );

      case 2:
        return (
          <SectionCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Pricing & Availability</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="pricePerDay"
                    label="Price per Day"
                    type="number"
                    value={formData.pricePerDay}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Pickup Location</InputLabel>
                    <Select
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      label="Pickup Location"
                    >
                      {locations.map((location) => (
                        <MenuItem key={location} value={location}>
                          {location}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Availability Status</InputLabel>
                    <Select
                      name="available"
                      value={formData.available}
                      onChange={handleInputChange}
                      label="Availability Status"
                    >
                      <MenuItem value={true}>Available for Rent</MenuItem>
                      <MenuItem value={false}>Not Available</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Vehicle Status</InputLabel>
                    <Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      label="Vehicle Status"
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        );

      case 3:
        return (
          <SectionCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Features & Media</Typography>
              </Box>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    name="imageUrl"
                    label="Image URL"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="https://example.com/car-image.jpg"
                    helperText="Provide a URL to an image of the vehicle"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="features"
                    label="Features"
                    value={formData.features}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="AC,GPS,Bluetooth,Cruise Control,Lane Assist"
                    multiline
                    rows={2}
                    helperText="Comma-separated list of vehicle features"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="description"
                    label="Description"
                    value={formData.description}
                    onChange={handleInputChange}
                    fullWidth
                    required
                    multiline
                    rows={4}
                    placeholder="Describe the vehicle's condition, special features, and rental highlights..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </SectionCard>
        );

      case 4:
        return (
          <PreviewCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PreviewIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Review Vehicle Details</Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Basic Information
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip label={`${formData.make} ${formData.model} (${formData.year})`} color="primary" sx={{ mb: 1 }} />
                    <Typography variant="body2">Color: {formData.color}</Typography>
                    {formData.licensePlate && (
                      <Typography variant="body2">License: {formData.licensePlate}</Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Specifications
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Category: {formData.category}</Typography>
                    <Typography variant="body2">Seats: {formData.seats}</Typography>
                    <Typography variant="body2">Transmission: {formData.transmission}</Typography>
                    <Typography variant="body2">Fuel: {formData.fuelType}</Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Pricing & Location
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2">Price: ${formData.pricePerDay}/day</Typography>
                    <Typography variant="body2">Location: {formData.location}</Typography>
                    <Typography variant="body2">
                      Available: {formData.available ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body2">
                      Status: {formData.status}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic', color: 'text.secondary' }}>
                      MySQL Fields: price_per_day=${formData.pricePerDay}, is_available={formData.isAvailable ? 'true' : 'false'}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Features
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {formData.features ? (
                      formData.features.split(',').map((feature, index) => (
                        <Chip key={index} label={feature.trim()} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No features listed</Typography>
                    )}
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {formData.description || 'No description provided'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </PreviewCard>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <StyledCard>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={() => navigate('/admin/cars')}
                sx={{ mr: 2, color: 'white' }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h4" component="h1">
                  Add New Vehicle
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Enter vehicle details to add to your rental fleet
                </Typography>
              </Box>
            </Box>
            <CarIcon sx={{ fontSize: 60, opacity: 0.3 }} />
          </Box>
        </CardContent>
      </StyledCard>

      {/* Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel>
                  <Typography variant="h6">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {step.description}
                  </Typography>
                  
                  {renderStepContent(index)}
                  
                  <Box sx={{ mt: 2 }}>
                    <div>
                      {index === steps.length - 1 ? (
                        <Button
                          variant="contained"
                          onClick={handleSubmit}
                          disabled={loading}
                          startIcon={<SaveIcon />}
                          size="large"
                        >
                          {loading ? 'Adding Vehicle...' : 'Add Vehicle to Database'}
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          disabled={!validateStep(index)}
                          sx={{ mt: 1, mr: 1 }}
                        >
                          Continue
                        </Button>
                      )}
                      <Button
                        disabled={index === 0}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}
                      >
                        Back
                      </Button>
                    </div>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AddVehicle;