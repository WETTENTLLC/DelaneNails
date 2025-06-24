import React from 'react';
import { 
  Box, 
  Paper, 
  Grid, 
  Button, 
  Typography 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

const DateFilter = ({ startDate, endDate, onStartDateChange, onEndDateChange, onFilter, onReset }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filter Appointments
      </Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={onStartDateChange}
              renderInput={(params) => <div {...params} />}
              format="MM/dd/yyyy"
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={onEndDateChange}
              renderInput={(params) => <div {...params} />}
              format="MM/dd/yyyy"
              minDate={startDate}
            />
          </LocalizationProvider>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Box display="flex" gap={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={onFilter}
              disabled={!startDate && !endDate}
            >
              Apply Filter
            </Button>
            <Button 
              variant="outlined" 
              onClick={onReset}
            >
              Reset
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DateFilter;
