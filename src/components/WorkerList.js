// WorkerList.js
import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import CreateUser from '../pages/CreateUser';

const WorkerList = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [selectedWorkerEmail, setSelectedWorkerEmail] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWorkers(data);
      } else {
        const errorData = await response.json();
        alert('Error fetching workers: ' + errorData.message);
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

  const handleWorkerSelect = (workerId, workerEmail) => {
    setSelectedWorkerId(workerId);
    setSelectedWorkerEmail(workerEmail);
    setShowCreateUser(false);
  };

  const handleDeleteWorker = async (workerId, workerName) => {
    if (window.confirm(`Are you sure you want to delete worker "${workerName}"? This will also delete all their assigned tasks.`)) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${workerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          alert('Worker deleted successfully');
          fetchWorkers();
          if (selectedWorkerId === workerId) {
            setSelectedWorkerId(null);
            setSelectedWorkerEmail('');
          }
        } else {
          const error = await response.json();
          alert('Error deleting worker: ' + error.message);
        }
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Error deleting worker: ' + error.message);
      }
    }
  };

  const handleUserCreated = () => {
    fetchWorkers();
    setShowCreateUser(false);
  };

  const handleTaskAssigned = () => {
    setSelectedWorkerId(null);
    setSelectedWorkerEmail('');
    fetchWorkers();
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border text-gold" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Loading workers...</div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-teal">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-white">Workers</h5>
                <button
                  className="btn btn-outline-light btn-sm"
                  onClick={() => {
                    setShowCreateUser(true);
                    setSelectedWorkerId(null);
                    setSelectedWorkerEmail('');
                  }}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Create New Worker
                </button>
              </div>
            </div>
            <div className="card-body">
              {workers.length === 0 ? (
                <div className="alert alert-info">
                  <i className="bi bi-info-circle me-2"></i>
                  No workers found. Create a new worker to get started.
                </div>
              ) : (
                <div className="list-group">
                  {workers.map(worker => (
                    <div
                      key={worker.id}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <h6 className="mb-1">{worker.name}</h6>
                        <small className="text-muted">{worker.email}</small>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        <button
                          className={`btn btn-sm ${selectedWorkerId === worker.id ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleWorkerSelect(worker.id, worker.email)}
                        >
                          {selectedWorkerId === worker.id ? 'Selected' : 'Select'}
                        </button>
                        <button
                          className="btn btn-outline-danger btn-sm"
                          onClick={() => handleDeleteWorker(worker.id, worker.name)}
                          title="Delete Worker"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-teal">
              <h5 className="mb-0 text-white">
                {showCreateUser ? 'Create New Worker' : (selectedWorkerId ? 'Assign Task' : 'Select a Worker')}
              </h5>
            </div>
            <div className="card-body">
              {showCreateUser ? (
                <CreateUser onUserCreated={handleUserCreated} />
              ) : selectedWorkerId ? (
                <TaskForm
                  workerId={selectedWorkerId}
                  workerEmail={selectedWorkerEmail}
                  onTaskAssigned={handleTaskAssigned}
                />
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-arrow-left" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                  <p className="text-muted mt-3">Select a worker from the list to assign a task</p>
                  <p className="text-muted small">Or create a new worker to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerList;