import React, { useState, useEffect } from 'react';
import TodoList from '../components/TodoList';
import { useNavigate } from 'react-router-dom';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          // Check if Google tokens exist and prompt for authorization
          if (!data.user.googleAccessToken) {
            const connect = window.confirm('Connect your Google Calendar to sync tasks. Proceed?');
            if (connect) {
              window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
            }
          }
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="container-fluid">
      <nav className="navbar navbar-light bg-light border-bottom mb-4">
        <div className="container-fluid">
          <div>
            <span className="navbar-brand mb-0 h1">Worker Dashboard</span>
            {user && (
              <small className="text-muted d-block">
                Welcome, {user.name} ({user.email})
              </small>
            )}
          </div>
          <button 
            className="btn btn-outline-danger" 
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </nav>
      <TodoList />
    </div>
  );
};

export default WorkerDashboard;