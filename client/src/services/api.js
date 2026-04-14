import axios from 'axios';

// Instantiate Axios with strict security boundaries
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
    withCredentials: true, // Absolutely essential to ensure the browser transmits our secure HttpOnly JWT cookies
    headers: {
        'Content-Type': 'application/json',
    }
});

// Configure Global Response Interceptors
api.interceptors.response.use(
    (response) => {
        // Any status code that lie within the range of 2xx cause this function to trigger
        return response;
    },
    (error) => {
        // Any status codes that falls outside the range of 2xx cause this function to trigger
        
        // If the API bounces a 401 Unauthorized, we know the HttpOnly cookie either expired or is missing.
        // We force standard JS page reload routing to the login screen softly wiping existing mock state
        if (error.response && error.response.status === 401) {
            // Check if we aren't already on the auth panels to avoid infinite reload loop bounds
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup' && window.location.pathname !== '/') {
                window.location.href = '/login';
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;
