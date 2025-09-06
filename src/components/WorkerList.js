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
        console.error('Error fetching workers');
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
          // Reset selection if the deleted worker was selected
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

  const handleTaskAssigned = () => {
    // Refresh the worker list or perform any other necessary updates
    fetchWorkers();
  };

  const handleUserCreated = () => {
    fetchWorkers();
    setShowCreateUser(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-teal mb-4">Worker Management</h2>
        <div className="text-center">
          <div className="spinner-border text-teal" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading workers...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-teal mb-0">Worker Management</h2>
        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-primary btn-sm" 
            onClick={fetchWorkers}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Refresh
          </button>
          <button 
            className="btn btn-success btn-sm" 
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

      <div className="row">
        {/* Workers List */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header bg-teal">
              <h5 className="mb-0 text-white">Workers ({workers.length})</h5>
            </div>
            <div className="card-body" style={{maxHeight: '600px', overflowY: 'auto'}}>
              {workers.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-people" style={{fontSize: '3rem', color: '#6c757d'}}></i>
                  <p className="text-muted mt-2">No workers found</p>
                  <p className="text-muted small">Create your first worker to get started</p>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {workers.map(worker => (
                    <div key={worker.id} className="list-group-item d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <h6 className="mb-1 text-teal">{worker.name}</h6>
                          <small className={`badge ${worker.isActive ? 'bg-success' : 'bg-secondary'}`}>
                            {worker.isActive ? 'Active' : 'Inactive'}
                          </small>
                        </div>
                        <p className="mb-1 text-muted">{worker.email}</p>
                        <div className="d-flex justify-content-between">
                          <small className="text-muted">
                            <i className="bi bi-calendar-plus me-1"></i>
                            Joined: {formatDate(worker.createdAt)}
                          </small>
                        </div>
                        {worker.lastLogin && (
                          <small className="text-muted d-block">
                            <i className="bi bi-clock me-1"></i>
                            Last login: {formatDate(worker.lastLogin)}
                          </small>
                        )}
                      </div>
                      <div className="ms-3 d-flex flex-column gap-1">
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

        {/* Right Panel - Task Assignment or Create User */}
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
                  <i className="bi bi-arrow-left" style={{fontSize: '3rem', color: '#6c757d'}}></i>
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