import { create } from 'zustand';
import axios from 'axios';

const BACKEND_URL = 'https://questify-6xs1.onrender.com';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/auth/login`, { email, password });
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            set({ user: data, token: data.token, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
            return false;
        }
    },

    register: async (name, email, password, role) => {
        set({ isLoading: true, error: null });
        try {
            const { data } = await axios.post(`${BACKEND_URL}/api/auth/register`, { name, email, password, role });
            localStorage.setItem('user', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            set({ user: data, token: data.token, isLoading: false });
            return true;
        } catch (error) {
            set({ error: error.response?.data?.message || 'Registration failed', isLoading: false });
            return false;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
    }
}));

export default useAuthStore;
