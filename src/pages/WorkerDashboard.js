// WorkerDashboard.js - Clean version with debug panels removed
import React, { useState, useEffect } from 'react';
import TodoList from '../components/TodoList';
import { useNavigate, useLocation } from 'react-router-dom';

const WorkerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [googleCalendarStatus, setGoogleCalendarStatus] = useState(null);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/');
          return;
        }

        console.log('Attempting to verify user with token:', token ? 'Present' : 'Missing');
        console.log('API URL:', process.env.REACT_APP_API_URL);

        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });

        console.log('Verify response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('User verified successfully:', data.user);
          setUser(data.user);
          setAuthError(null);
          
          // Check Google Calendar status
          await checkGoogleCalendarStatus();
        } else {
          const errorData = await response.json();
          console.error('User verification failed:', errorData);
          setAuthError(`Auth failed: ${response.status} - ${errorData.message}`);
          localStorage.removeItem('token');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setAuthError(`Network error: ${error.message}`);
        localStorage.removeItem('token');
        navigate('/');
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    // Handle OAuth callback parameters
    const urlParams = new URLSearchParams(location.search);
    const googleAuth = urlParams.get('googleAuth');
    
    if (googleAuth === 'success') {
      alert('Google Calendar connected successfully!');
      setShowGooglePrompt(false);
      window.history.replaceState({}, document.title, location.pathname);
      checkGoogleCalendarStatus();
    } else if (googleAuth === 'error') {
      alert('Failed to connect Google Calendar. Please try again.');
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location]);

  const checkGoogleCalendarStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setGoogleCalendarStatus(data.connected);
        
        if (!data.connected && localStorage.getItem('googleCalendarPromptDismissed') !== 'true') {
          setShowGooglePrompt(true);
        }
      } else {
        console.log('Could not check Google Calendar status');
      }
    } catch (error) {
      console.error('Error checking Google Calendar status:', error);
    }
  };

  const handleConnectGoogleCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again to connect Google Calendar');
        navigate('/');
        return;
      }
      
      // Make a fetch request with the Authorization header
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // If the response is a redirect, get the URL from the response
        const redirectUrl = response.url;
        window.location.href = redirectUrl;
      } else if (response.redirected) {
        // Handle redirect manually
        window.location.href = response.url;
      } else {
        // If response contains JSON with redirect URL
        const data = await response.json().catch(() => null);
        if (data && data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          alert('Failed to connect to Google Calendar. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      alert('Failed to connect to Google Calendar. Please try again.');
    }
  };

  const handleDisconnectGoogleCalendar = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/google/disconnect`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        setGoogleCalendarStatus(false);
        alert('Google Calendar disconnected successfully!');
      } else {
        alert('Failed to disconnect Google Calendar. Please try again.');
      }
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      alert('Failed to disconnect Google Calendar. Please try again.');
    }
  };

  const handleDismissGooglePrompt = () => {
    setShowGooglePrompt(false);
    localStorage.setItem('googleCalendarPromptDismissed', 'true');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('googleCalendarPromptDismissed');
    navigate('/');
  };

  if (!user && !authError) {
    return <div style={{ color: '#ffffff', textAlign: 'center', backgroundColor: '#000000ff' }}>Loading...</div>;
  }

  if (authError) {
    return (
      <div style={{ color: '#ffffff', textAlign: 'center', backgroundColor: '#000000ff', padding: '20px' }}>
        <h3>Authentication Error</h3>
        <p>{authError}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid" style={{ backgroundColor: '#000000ff' }}>
      <nav className="navbar navbar-light bg-light border-bottom mb-4">
        <div className="container-fluid">
          <div>
            <span className="navbar-brand mb-0 h1">Worker Dashboard</span>
            <small className="text-muted d-block">
              Welcome, {user.name} ({user.email})
            </small>
            {googleCalendarStatus !== null && (
              <small className={`d-block ${googleCalendarStatus ? 'text-success' : 'text-warning'}`}>
                Google Calendar: {googleCalendarStatus ? 'Connected' : 'Not Connected'}
                {googleCalendarStatus && (
                  <button 
                    className="btn btn-link btn-sm text-danger p-0 ms-2" 
                    onClick={handleDisconnectGoogleCalendar}
                    style={{textDecoration: 'none', fontSize: '0.75rem'}}
                  >
                    Disconnect
                  </button>
                )}
              </small>
            )}
          </div>
          <div className="d-flex gap-2">
            {googleCalendarStatus === false && (
              <button 
                className="btn btn-outline-success btn-sm" 
                onClick={handleConnectGoogleCalendar}
              >
                Connect Google Calendar
              </button>
            )}
            <button 
              className="btn btn-outline-danger" 
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Google Calendar Connection Prompt */}
      {showGooglePrompt && (
        <div className="alert alert-info alert-dismissible mx-3 mb-3" role="alert">
          <h6 className="alert-heading">Connect Google Calendar</h6>
          <p className="mb-2">
            Connect your Google Calendar to automatically sync your TaskPilot deadlines. 
            This will help you stay organized and never miss a deadline!
          </p>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleConnectGoogleCalendar}
            >
              Connect Now
            </button>
            <button 
              className="btn btn-outline-secondary btn-sm" 
              onClick={handleDismissGooglePrompt}
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      <TodoList />
    </div>
  );
};

export default WorkerDashboard;