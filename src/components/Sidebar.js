import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin',
      icon: 'bi-people',
      label: 'Workers',
      description: 'Manage workers and assign tasks'
    },
    {
      path: '/admin/review',
      icon: 'bi-clipboard-check',
      label: 'Review Queue',
      description: 'Review submitted work'
    },
    {
      path: '/admin/completed',
      icon: 'bi-check-circle',
      label: 'Completed Work',
      description: 'View approved tasks'
    }
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname === path;
  };

  return (
    <div 
      className="sidebar border-end" 
      style={{ 
        width: '280px', 
        minHeight: '100vh', 
        backgroundColor: '#000000',
        borderRight: '2px solid #00A3AD' 
      }}
    >
      <div className="p-3">
        <div className="d-flex align-items-center mb-4">
          <i 
            className="bi bi-kanban me-2" 
            style={{
              fontSize: '1.5rem',
              color: '#00A3AD'
            }}
          ></i>
          <h4 className="mb-0" style={{ color: '#00A3AD' }}>TaskPilot</h4>
        </div>
        
        <nav className="nav flex-column">
          {menuItems.map((item) => (
            <button
              key={item.path}
              className={`nav-link text-start p-3 mb-2 border-0 rounded`}
              onClick={() => navigate(item.path)}
              style={{
                transition: 'all 0.2s',
                backgroundColor: isActive(item.path) ? '#00A3AD' : 'transparent',
                color: '#ffffff',
                border: `1px solid ${isActive(item.path) ? '#00A3AD' : '#00A3AD'}`
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = '#00A3AD';
                  e.target.style.opacity = '0.8';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.opacity = '1';
                }
              }}
            >
              <div className="d-flex align-items-start">
                <i className={`${item.icon} me-3 mt-1`} style={{fontSize: '1.2rem'}}></i>
                <div>
                  <div className="fw-semibold">{item.label}</div>
                  <small className="opacity-75 d-block">{item.description}</small>
                </div>
              </div>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="mt-auto p-3">
        <div className="pt-3" style={{ borderTop: '1px solid #00A3AD' }}>
          <small className="d-block text-center" style={{ color: '#ffffff' }}>
            <i className="bi bi-shield-check me-1"></i>
            Admin Panel
          </small>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;