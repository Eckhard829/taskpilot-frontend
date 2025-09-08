import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import WorkerList from '../components/WorkerList';
import ReviewQueue from '../components/ReviewQueue';
import CompletedWork from '../components/CompletedWork';

const AdminDashboard = () => {
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
    <div className="d-flex" style={{ backgroundColor: '#000000', minHeight: '100vh' }}>
      <Sidebar />
      <div className="flex-grow-1">
        <nav className="navbar navbar-dark" style={{ 
          backgroundColor: '#000000', 
          borderBottom: '2px solid #00A3AD' 
        }}>
          <div className="container-fluid">
            <div>
              <span className="navbar-brand mb-0 h1" style={{ color: '#00A3AD' }}>
                Admin Dashboard
              </span>
              {user && (
                <small className="d-block" style={{ color: '#ffffff' }}>
                  Welcome, {user.name} ({user.email})
                </small>
              )}
            </div>
            <button 
              className="btn"
              onClick={handleLogout}
              style={{
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid #ffffff',
                fontWeight: '500'
              }}
            >
              Logout
            </button>
          </div>
        </nav>
        
        <div className="p-3" style={{ backgroundColor: '#000000', minHeight: 'calc(100vh - 80px)' }}>
          <Routes>
            <Route path="/" element={<WorkerList />} />
            <Route path="/review" element={<ReviewQueue />} />
            <Route path="/completed" element={<CompletedWork />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;