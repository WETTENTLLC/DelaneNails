import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class AppointmentService {
  // Get all appointments
  async getAppointments(startDate, endDate) {
    try {
      let url = `${API_URL}/appointments`;
      
      // Add query params for date filtering if provided
      if (startDate || endDate) {
        url += '?';
        if (startDate) {
          url += `startDate=${startDate}`;
        }
        if (endDate) {
          url += startDate ? `&endDate=${endDate}` : `endDate=${endDate}`;
        }
      }
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Get appointment by ID
  async getAppointment(id) {
    try {
      const response = await axios.get(`${API_URL}/appointments/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Create new appointment
  async createAppointment(appointmentData) {
    try {
      const response = await axios.post(`${API_URL}/appointments`, appointmentData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Update existing appointment
  async updateAppointment(id, appointmentData) {
    try {
      const response = await axios.put(`${API_URL}/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Delete appointment
  async deleteAppointment(id) {
    try {
      const response = await axios.delete(`${API_URL}/appointments/${id}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  // Error handler
  handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error("Error response:", error.response.data);
      console.error("Status code:", error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("Error request:", error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error("Error message:", error.message);
    }
  }
}

export default new AppointmentService();
