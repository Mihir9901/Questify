import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
    // Use the full Render URL here directly to avoid environment variable issues
    baseURL: 'https://questify-6xs1.onrender.com/api',
});

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;