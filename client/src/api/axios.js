// src/api/axios.js
import axios from 'axios';

export default axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Replace with your backend server address
    headers: { 'Content-Type': 'application/json' }
});
