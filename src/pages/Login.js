import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e, retries = 5, delay = 2000) => {
    e.preventDefault();
    setLoading(true);

    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          timeout: 10000,
        });

        if (response.ok) {
          const { token, user } = await response.json();
          localStorage.setItem('token', token);
          if (user.role === 'admin') {
            navigate('/admin');
          } else if (user.role === 'worker') {
            navigate('/worker');
          } else {
            alert('Invalid role');
          }
          break;
        } else {
          const error = await response.json();
          if (i === retries - 1) {
            alert('Login failed: ' + error.message);
          }
        }
      } catch (error) {
        if (i === retries - 1) {
          console.error('Login error:', error);
          alert('Login failed: Unable to connect to the server. Please check your network or try again later.');
        }
      }
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center">TaskPilot Login</h2>
              <form onSubmit={(e) => handleLogin(e)}>
                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password:</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;