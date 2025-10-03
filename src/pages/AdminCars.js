import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Fab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  AddCircle as AddCircleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import carService from '../services/carService';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const AdminCars = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    category: '',
    pricePerDay: '',
    location: '',
    seats: '',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    features: '',
    description: '',
    imageUrl: '',
    color: '',
    licensePlate: '',
    mileage: '',
    available: true,
  });

  const categories = ['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Economy', 'Sports', 'Electric'];
  const locations = ['Downtown', 'Airport', 'North Station', 'South Terminal', 'City Center', 'Mall Complex'];
  const transmissions = ['Automatic', 'Manual'];
  const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carService.getAllCars();
      if (response.data && Array.isArray(response.data)) {
        setCars(response.data);
      } else {
        setCars([]);
        showSnackbar('No cars found in database', 'info');
      }
    } catch (error) {
      console.error('Error fetching cars:', error);
      setCars([]);
      showSnackbar('Failed to fetch cars from database', 'error');
    } finally {
      setLoading(false);
    }
  };

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

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Prepare car data for MySQL backend
      const carData = {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        pricePerDay: parseFloat(formData.pricePerDay),
        price_per_day: parseFloat(formData.pricePerDay),  // MySQL field name
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
        available: formData.available,
        is_available: formData.available,  // MySQL field name
        status: 'Active',                  // Default MySQL status
        features: formData.features,
      };

      if (editingCar) {
        await carService.updateCar(editingCar.id, carData);
        showSnackbar('Car updated successfully!');
      } else {
        await carService.createCar(carData);
        showSnackbar('Car added successfully!');
      }
      
      setOpenDialog(false);
      resetForm();
      fetchCars(); // Refresh the list
    } catch (error) {
      console.error('Error saving car:', error);
      showSnackbar('Failed to save car. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      make: car.make || '',
      model: car.model || '',
      year: car.year || new Date().getFullYear(),
      category: car.category || '',
      pricePerDay: car.pricePerDay || car.price_per_day || '',
      location: car.location || '',
      seats: car.seats || '',
      transmission: car.transmission || 'Automatic',
      fuelType: car.fuelType || 'Petrol',
      features: car.features || '',
      description: car.description || '',
      imageUrl: car.imageUrl || '',
      color: car.color || '',
      licensePlate: car.licensePlate || '',
      mileage: car.mileage || '',
      available: car.available !== undefined ? car.available : 
                car.is_available !== undefined ? car.is_available : true,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await carService.deleteCar(carId);
        showSnackbar('Car deleted successfully!');
        fetchCars();
      } catch (error) {
        console.error('Error deleting car:', error);
        showSnackbar('Failed to delete car', 'error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      category: '',
      pricePerDay: '',
      location: '',
      seats: '',
      transmission: 'Automatic',
      fuelType: 'Petrol',
      features: '',
      description: '',
      imageUrl: '',
      color: '',
      licensePlate: '',
      mileage: '',
      available: true,
    });
    setEditingCar(null);
  };

  const handleAddNew = () => {
    resetForm();
    setOpenDialog(true);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Car Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Add, edit, and manage cars in your rental fleet
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddCircleIcon />}
            onClick={() => navigate('/admin/cars/add')}
            size="large"
            sx={{ 
              backgroundColor: '#4caf50', 
              '&:hover': { backgroundColor: '#45a049' },
              fontWeight: 'bold'
            }}
          >
            Add New Vehicle
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            size="large"
          >
            Quick Add
          </Button>
        </Box>
      </Box>

      {/* Cars List */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Car</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price/Day</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cars.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4 }}>
                    <CarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No cars in database
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click "Add New Car" to get started
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {car.make} {car.model}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {car.year} • {car.seats} seats • {car.transmission}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={car.category} size="small" />
                  </TableCell>
                  <TableCell>${car.pricePerDay || car.price_per_day}/day</TableCell>
                  <TableCell>{car.location}</TableCell>
                  <TableCell>
                    <Chip 
                      label={(car.available || car.is_available) ? 'Available' : 'Not Available'} 
                      color={(car.available || car.is_available) ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(car)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(car.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Car Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCar ? 'Edit Car' : 'Add New Car'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="make"
                label="Make"
                value={formData.make}
                onChange={handleInputChange}
                fullWidth
                required
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
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="year"
                label="Year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
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
              <TextField
                name="pricePerDay"
                label="Price per Day ($)"
                type="number"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Location</InputLabel>
                <Select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  label="Location"
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
              <TextField
                name="seats"
                label="Number of Seats"
                type="number"
                value={formData.seats}
                onChange={handleInputChange}
                fullWidth
                required
              />
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
                name="imageUrl"
                label="Image URL"
                value={formData.imageUrl}
                onChange={handleInputChange}
                fullWidth
                placeholder="https://example.com/car-image.jpg"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="color"
                label="Color"
                value={formData.color}
                onChange={handleInputChange}
                fullWidth
                placeholder="e.g., Silver, Black, White"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="licensePlate"
                label="License Plate"
                value={formData.licensePlate}
                onChange={handleInputChange}
                fullWidth
                placeholder="e.g., ABC-123"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="mileage"
                label="Mileage"
                type="number"
                value={formData.mileage}
                onChange={handleInputChange}
                fullWidth
                placeholder="Current mileage"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  name="available"
                  value={formData.available}
                  onChange={handleInputChange}
                  label="Availability"
                >
                  <MenuItem value={true}>Available</MenuItem>
                  <MenuItem value={false}>Not Available</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="features"
                label="Features (comma-separated)"
                value={formData.features}
                onChange={handleInputChange}
                fullWidth
                placeholder="Air Conditioning, GPS, Bluetooth, etc."
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleInputChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : editingCar ? 'Update Car' : 'Add Car'}
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminCars;