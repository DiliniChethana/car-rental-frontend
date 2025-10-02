import React, { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Alert,
  Snackbar,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import carService from '../services/carService';
import { sampleCars } from '../data/sampleCars';

const DatabaseSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [addedCars, setAddedCars] = useState([]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const addSampleCars = async () => {
    setLoading(true);
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const carData of sampleCars) {
        try {
          const response = await carService.createCar(carData);
          results.push({
            car: `${carData.make} ${carData.model}`,
            status: 'success',
            id: response.data?.id || 'unknown'
          });
          successCount++;
        } catch (error) {
          console.error(`Error adding ${carData.make} ${carData.model}:`, error);
          results.push({
            car: `${carData.make} ${carData.model}`,
            status: 'error',
            error: error.response?.data?.message || 'Failed to add car'
          });
          errorCount++;
        }
      }

      setAddedCars(results);
      
      if (successCount > 0 && errorCount === 0) {
        showSnackbar(`Successfully added all ${successCount} cars to database!`, 'success');
      } else if (successCount > 0 && errorCount > 0) {
        showSnackbar(`Added ${successCount} cars, ${errorCount} failed`, 'warning');
      } else {
        showSnackbar('Failed to add cars to database', 'error');
      }
    } catch (error) {
      console.error('Error adding cars:', error);
      showSnackbar('Failed to add cars to database', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setAddedCars([]);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Database Seeder
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Add sample cars to your database for testing the car rental system
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="subtitle2" gutterBottom>
            This will add {sampleCars.length} sample cars to your database:
          </Typography>
          <ul>
            {sampleCars.map((car, index) => (
              <li key={index}>
                {car.make} {car.model} ({car.year}) - ${car.pricePerDay}/day
              </li>
            ))}
          </ul>
        </Alert>

        <Button
          variant="contained"
          size="large"
          onClick={addSampleCars}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          {loading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Adding Cars...
            </>
          ) : (
            'Add Sample Cars to Database'
          )}
        </Button>

        {addedCars.length > 0 && (
          <Button
            variant="outlined"
            onClick={clearResults}
            sx={{ ml: 2, mb: 3 }}
          >
            Clear Results
          </Button>
        )}
      </Box>

      {addedCars.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Results:
          </Typography>
          <List>
            {addedCars.map((result, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={result.car}
                  secondary={result.status === 'success' ? `Added with ID: ${result.id}` : result.error}
                />
                <Chip
                  label={result.status}
                  color={result.status === 'success' ? 'success' : 'error'}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

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

export default DatabaseSeeder;