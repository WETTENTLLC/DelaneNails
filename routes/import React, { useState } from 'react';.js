import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Typography,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';

const AppointmentList = ({ appointments, onEdit, onDelete, onAdd }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const handleDeleteClick = (appointment) => {
    setAppointmentToDelete(appointment);
    setConfirmDelete(true);
  };

  const confirmDeleteAction = () => {
    if (appointmentToDelete) {
      onDelete(appointmentToDelete._id);
      setConfirmDelete(false);
      setAppointmentToDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(false);
    setAppointmentToDelete(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy h:mm a');
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" component="h2" gutterBottom>
          Appointments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={onAdd}
        >
          New Appointment
        </Button>
      </Box>

      {appointments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No appointments found.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client</TableCell>
                <TableCell>Service</TableCell>
                <TableCell>Date & Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>{appointment.clientName}</TableCell>
                  <TableCell>
                    <Chip 
                      label={appointment.service} 
                      color={
                        appointment.service === 'Manicure' ? 'primary' :
                        appointment.service === 'Pedicure' ? 'secondary' :
                        appointment.service === 'Full Set' ? 'error' : 'default'
                      }
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(appointment.date)}</TableCell>
                  <TableCell>{appointment.duration} mins</TableCell>
                  <TableCell>
                    <Typography variant="body2">{appointment.phone}</Typography>
                    <Typography variant="body2" color="textSecondary">{appointment.email}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small"
                      onClick={() => onEdit(appointment)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={() => handleDeleteClick(appointment)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={cancelDelete}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the appointment for {appointmentToDelete?.clientName} on {appointmentToDelete ? formatDate(appointmentToDelete.date) : ''}?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteAction} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppointmentList;
