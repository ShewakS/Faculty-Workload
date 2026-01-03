import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const fetchWorkloadData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/workload`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workload data:', error);
    throw error;
  }
};

export const fetchInsights = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/insights`);
    return response.data;
  } catch (error) {
    console.error('Error fetching insights:', error);
    throw error;
  }
};

export const checkHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Error checking health:', error);
    throw error;
  }
};