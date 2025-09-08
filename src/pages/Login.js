import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Attempting login with:', { email });
      console.log('API URL:', process.env.REACT_APP_API_URL);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      const data = await response.json();
      console.log('Login response data:', data);

      if (response.ok) {
        localStorage.setItem('token', data.token);
        console.log('Token saved, user role:', data.user.role);
        
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/worker');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#000000' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg" style={{ 
              backgroundColor: '#000000',
              border: '2px solid #006064',
              boxShadow: '0 0 20px rgba(0, 96, 100, 0.4)'
            }}>
              <div className="card-body p-5" style={{ backgroundColor: '#000000' }}>
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center align-items-center mb-3">
                    <i className="bi bi-kanban me-2" style={{
                      fontSize: '2.5rem',
                      color: '#006064',
                      textShadow: '0 0 10px rgba(0, 96, 100, 0.6)'
                    }}></i>
                    <h1 className="h2 mb-0" style={{
                      color: '#006064',
                      textShadow: '0 0 10px rgba(0, 96, 100, 0.6)'
                    }}>TaskPilot</h1>
                  </div>
                  <p style={{ color: '#ffffff' }}>Task Management System</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label" style={{ color: '#006064' }}>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Enter your email"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '2px solid #006064',
                        color: '#000000',
                        boxShadow: '0 0 5px rgba(0, 96, 100, 0.3)'
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label" style={{ color: '#006064' }}>Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="Enter your password"
                      style={{
                        backgroundColor: '#ffffff',
                        border: '2px solid #006064',
                        color: '#000000',
                        boxShadow: '0 0 5px rgba(0, 96, 100, 0.3)'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 mb-3"
                    disabled={loading}
                    style={{
                      backgroundColor: '#006064',
                      border: '2px solid #006064',
                      color: '#ffffff',
                      fontWeight: '600',
                      boxShadow: '0 0 10px rgba(0, 96, 100, 0.4)'
                    }}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;