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
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <nav className="navbar navbar-light bg-light border-bottom" style={{ backgroundColor: '#000000' }}>
          <div className="container-fluid">
            <div>
              <span className="navbar-brand mb-0 h1 text-teal">Admin Dashboard</span>
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
        
        <div className="p-3">
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