import axios from '../axios';

const statisticService = {
  // Clinic and Specialty Lists
  getClinics() {
    return axios.get('/api/clinics');
  },

  getSpecialties() {
    return axios.get('/api/specialties');
  },

  getDashboardKPI(params) {
    return axios.get('/api/statistics/dashboard', { params });
  },

  getTimeSeries(params) {
    return axios.get('/api/statistics/time-series', { params });
  },

  getTopDoctors(params) {
    return axios.get('/api/statistics/doctors', { params });
  },

  getClinicStats(params) {
    return axios.get('/api/statistics/clinics', { params });
  },

  getSpecialtyStats(params) {
    return axios.get('/api/statistics/specialties', { params });
  },

  getBookingDetails(params) {
    return axios.get('/api/statistics/bookings', { params });
  },
};

export default statisticService;
