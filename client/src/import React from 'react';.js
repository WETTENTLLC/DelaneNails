import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Container,
  Avatar
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EventNoteIcon from '@mui/icons-material/EventNote';

const Header = () => {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Container maxWidth="lg">
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center">
            <Avatar 
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                mr: 2,
                width: 40, 
                height: 40 
              }}
            >
              <EventNoteIcon />
            </Avatar>
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              Delane Nails
            </Typography>
          </Box>
          
          <Box>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/"
            >
              Appointments
            </Button>
            <Button 
              color="inherit" 
              component={RouterLink} 
              to="/services"
            >
              Services
            </Button>
            <Button 
              variant="outlined" 
              color="inherit" 
              sx={{ ml: 2, borderColor: 'white', '&:hover': { borderColor: 'rgba(255,255,255,0.8)' } }}
              component={RouterLink}
              to="/contact"
            >
              Contact
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
