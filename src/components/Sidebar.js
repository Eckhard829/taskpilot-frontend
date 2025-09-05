import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="d-flex flex-column flex-shrink-0 p-3 bg-light sidebar" style={{width: '280px', height: '100vh'}}>
      <ul className="nav nav-pills flex-column mb-auto">
        <li className="nav-item">
          <Link 
            to="/admin" 
            className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            Workers & Tasks
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/admin/review" 
            className={`nav-link ${location.pathname === '/admin/review' ? 'active' : ''}`}
          >
            Review Queue
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/admin/completed" 
            className={`nav-link ${location.pathname === '/admin/completed' ? 'active' : ''}`}
          >
            Completed Work
          </Link>
        </li>
        <li className="nav-item">
          <Link 
            to="/create-user" 
            className={`nav-link ${location.pathname === '/create-user' ? 'active' : ''}`}
          >
            Create New User
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;