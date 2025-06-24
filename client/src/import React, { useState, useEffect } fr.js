import React, { useState, useEffect } from 'react';
import { Container, Box, Alert, Snackbar, CircularProgress } from '@mui/material';
import { format } from 'date-fns';

import AppointmentList from '../components/AppointmentList';
import AppointmentForm from '../components/AppointmentForm';
import DateFilter from '../components/DateFilter';
import appointmentService from '../services/appointmentService';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async (start = null, end = null) => {
    setLoading(true);
    try {
      let formattedStartDate = start ? format(start, 'yyyy-MM-dd') : null;
      let formattedEndDate = end ? format(end, 'yyyy-MM-dd') : null;
      
      const data = await appointmentService.getAppointments(formattedStartDate, formattedEndDate);
      setAppointments(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setCurrentAppointment(null);
    setIsEditMode(false);
    setFormOpen(true);
  };

  const handleEditClick = (appointment) => {
    setCurrentAppointment(appointment);
    setIsEditMode(true);
    setFormOpen(true);
  };

  const handleDeleteClick = async (id) => {
    try {
      await appointmentService.deleteAppointment(id);
      setAppointments(appointments.filter(app => app._id !== id));
      showNotification('Appointment deleted successfully', 'success');
    } catch (err) {
      console.error('Error deleting appointment:', err);
      showNotification('Failed to delete appointment', 'error');
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
  };

  const handleFormSave = async (formData) => {
    try {
      if (isEditMode) {
        const updated = await appointmentService.updateAppointment(currentAppointment._id, formData);
        setAppointments(appointments.map(app => app._id === updated._id ? updated : app));
        showNotification('Appointment updated successfully', 'success');
      } else {
        const created = await appointmentService.createAppointment(formData);
        setAppointments([...appointments, created]);
        showNotification('Appointment created successfully', 'success');
      }
      return true;
    } catch (err) {
      console.error('Error saving appointment:', err);
      if (err.response && err.response.status === 409) {
        showNotification('This time slot conflicts with another appointment', 'error');
      } else {
        showNotification('Failed to save appointment', 'error');
      }
      throw err;
    }
  };

  const handleFilter = () => {
    fetchAppointments(startDate, endDate);
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    fetchAppointments();
  };

  const showNotification = (message, type) => {
    setNotification({ open: true, message, type });
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        {/* Date filtering component */}
        <DateFilter 
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onFilter={handleFilter}
          onReset={handleResetFilter}
        />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <AppointmentList 
            appointments={appointments} 
            onEdit={handleEditClick} 
            onDelete={handleDeleteClick} 
            onAdd={handleAddClick}
          />
        )}
      </Box>
      
      {/* Appointment Form Dialog */}
      <AppointmentForm 
        open={formOpen}
        onClose={handleFormClose}
        appointment={currentAppointment}
        onSave={handleFormSave}
        isEdit={isEditMode}
      />
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AppointmentsPage;
