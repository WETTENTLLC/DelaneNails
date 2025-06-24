import React, { useState, useEffect } from 'react';
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Grid,
  Box,
  Alert
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const services = [
  { value: 'Manicure', duration: 45 },
  { value: 'Pedicure', duration: 60 },
  { value: 'Gel Polish', duration: 60 },
  { value: 'Nail Extensions', duration: 90 },
  { value: 'Nail Art', duration: 30 },
  { value: 'Full Set', duration: 120 }
];

const AppointmentForm = ({ open, onClose, appointment, onSave, isEdit }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    service: '',
    date: new Date(),
    duration: 60,
    phone: '',
    email: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (appointment) {
      setFormData({
        ...appointment,
        date: appointment.date ? new Date(appointment.date) : new Date()
      });
    } else {
      resetForm();
    }
  }, [appointment]);

  const resetForm = () => {
    setFormData({
      clientName: '',
      service: '',
      date: new Date(),
      duration: 60,
      phone: '',
      email: '',
      notes: ''
    });
    setErrors({});
    setServerError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // If there was an error for this field, clear it
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    
    // Set duration based on service
    if (name === 'service') {
      const selectedService = services.find(s => s.value === value);
      if (selectedService) {
        setFormData(prev => ({ ...prev, duration: selectedService.duration }));
      }
    }
  };

  const handleDateChange = (newDate) => {
    setFormData({ ...formData, date: newDate });
    if (errors.date) {
      setErrors({ ...errors, date: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    
    if (!formData.service) {
      newErrors.service = 'Service is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (formData.date < new Date() && !isEdit) {
      newErrors.date = 'Cannot schedule appointments in the past';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9()\-+\s]*$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const formattedData = {
          ...formData,
          date: formData.date.toISOString()
        };
        await onSave(formattedData);
        onClose();
      } catch (error) {
        console.error('Error saving appointment:', error);
        if (error.response && error.response.data) {
          setServerError(error.response.data.message || 'Error saving appointment');
        } else {
          setServerError('Error saving appointment. Please try again later.');
        }
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Appointment' : 'New Appointment'}</DialogTitle>
      <DialogContent>
        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              name="clientName"
              label="Client Name"
              value={formData.clientName}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!errors.clientName}
              helperText={errors.clientName}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="dense" error={!!errors.service}>
              <InputLabel id="service-label">Service</InputLabel>
              <Select
                labelId="service-label"
                name="service"
                value={formData.service}
                onChange={handleChange}
                label="Service"
              >
                {services.map((service) => (
                  <MenuItem key={service.value} value={service.value}>
                    {service.value} ({service.duration} min)
                  </MenuItem>
                ))}
              </Select>
              {errors.service && <Box sx={{ color: 'error.main', mt: 1, fontSize: '0.75rem' }}>{errors.service}</Box>}
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Appointment Date & Time"
                value={formData.date}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    margin="dense"
                    error={!!errors.date}
                    helperText={errors.date}
                  />
                )}
                format="yyyy-MM-dd HH:mm"
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="duration"
              label="Duration (minutes)"
              type="number"
              value={formData.duration}
              onChange={handleChange}
              fullWidth
              margin="dense"
              InputProps={{ inputProps: { min: 15 } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="phone"
              label="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!errors.phone}
              helperText={errors.phone}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              label="Email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              margin="dense"
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              name="notes"
              label="Notes"
              value={formData.notes || ''}
              onChange={handleChange}
              fullWidth
              margin="dense"
              multiline
              rows={3}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AppointmentForm;
