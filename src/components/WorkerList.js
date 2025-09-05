import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';

const WorkerList = () => {
  const [workers, setWorkers] = useState([]);
  const [expandedWorker, setExpandedWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      } else {
        console.error('Failed to fetch workers');
        alert('Failed to fetch workers. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
      alert('Error fetching workers: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleExpand = (workerId) => {
    setExpandedWorker(expandedWorker === workerId ? null : workerId);
  };

  if (loading) {
    return (
      <div className="p-3">
        <h2>Workers</h2>
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading workers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Workers</h2>
        <button 
          className="btn btn-outline-primary btn-sm" 
          onClick={fetchWorkers}
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      
      {workers.length === 0 ? (
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          No workers found. Create some worker accounts first using the "Create New User" option in the sidebar.
        </div>
      ) : (
        <>
          <div className="mb-3">
            <small className="text-muted">
              {workers.length} worker{workers.length !== 1 ? 's' : ''} available
            </small>
          </div>
          <div className="list-group">
            {workers.map(worker => (
              <div key={worker.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">{worker.name}</h5>
                    <small className="text-muted">
                      <i className="bi bi-envelope me-1"></i>
                      {worker.email}
                    </small>
                    <div className="mt-1">
                      <small className="text-muted">
                        <i className="bi bi-calendar-plus me-1"></i>
                        Joined: {new Date(worker.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <button 
                    className={`btn btn-sm ${expandedWorker === worker.id ? 'btn-outline-secondary' : 'btn-primary'}`}
                    onClick={() => handleExpand(worker.id)}
                  >
                    <i className={`bi ${expandedWorker === worker.id ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i>
                    {expandedWorker === worker.id ? 'Cancel' : 'Assign Task'}
                  </button>
                </div>
                
                {expandedWorker === worker.id && (
                  <div className="mt-3">
                    <TaskForm 
                      workerId={worker.id}
                      workerEmail={worker.email}
                      onTaskAssigned={() => {
                        setExpandedWorker(null);
                        // Optionally refresh workers list or show success
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerList;