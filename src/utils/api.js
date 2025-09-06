// Create this as src/utils/api.js
const API_BASE = process.env.REACT_APP_API_URL;

// Authenticated fetch utility
export const authFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  console.log('AuthFetch called:', endpoint);
  console.log('Token exists:', !!token);
  console.log('API Base:', API_BASE);
  
  if (!token) {
    console.error('No token available for authenticated request');
    throw new Error('No authentication token found');
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  console.log('Request config:', {
    url: `${API_BASE}${endpoint}`,
    method: config.method || 'GET',
    headers: config.headers
  });

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    console.log('Response status:', response.status);
    console.log('Response headers:', [...response.headers.entries()]);

    // Handle authentication errors
    if (response.status === 401) {
      console.error('Authentication failed - removing token');
      localStorage.removeItem('token');
      window.location.href = '/';
      throw new Error('Authentication failed');
    }

    if (response.status === 403) {
      console.error('Access forbidden');
      throw new Error('Access denied');
    }

    // Parse response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(data.message || `HTTP ${response.status}`);
      }
      
      return data;
    } else {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response;
    }
  } catch (error) {
    console.error('AuthFetch error:', error);
    throw error;
  }
};

// Specific API functions
export const api = {
  // Auth endpoints
  login: (credentials) => 
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    }),
  
  verifyToken: () => authFetch('/auth/verify'),
  
  // Work endpoints
  getTasks: () => authFetch('/work'),
  completeTask: (taskId, data) => authFetch(`/work/complete/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  
  // Google Calendar
  getGoogleStatus: () => authFetch('/auth/google/status'),
  disconnectGoogle: () => authFetch('/auth/google/disconnect', { method: 'POST' }),
  
  // Health check
  healthCheck: () => fetch(`${API_BASE}/health`).then(r => r.json())
};

export default api;