// TodoList.js
import React, { useState, useEffect } from 'react';
import CompletionModal from './CompletionModal';
import TaskDetailModal from './TaskDetailModal';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    setError(null);
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/work`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        setError(null);
      } else {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          setError('Authentication expired. Please login again.');
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
        } else if (response.status === 403) {
          setError('Access denied. Please check your permissions.');
        } else {
          setError(`Error fetching tasks (${response.status}): ${errorData.message || response.statusText}`);
        }
      }
    } catch (error) {
      setError(`Network error: ${error.message}. Please check your connection.`);
    } finally {
      setLoading(false);
    }
  };

  const refreshTasks = () => {
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = (task) => {
    setSelectedTask(task);
  };

  const handleViewDetails = (task) => {
    setDetailTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleCloseDetailModal = () => {
    setDetailTask(null);
  };

  const pendingTasks = tasks.filter(task => ['pending', 'rejected'].includes(task.status));
  const completedTasks = tasks.filter(task => task.status === 'submitted');

  if (loading) {
    return (
      <div>
        <h2 className="text-gold mb-4">Work To Do</h2>
        <div className="text-center">
          <div className="spinner-border text-gold" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading tasks...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="text-gold">Work To Do</h2>
          <small className="text-muted">Tasks assigned to you</small>
        </div>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={refreshTasks}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {pendingTasks.length === 0 && completedTasks.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No tasks assigned to you at the moment.
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h4 className="text-gold">Pending Tasks</h4>
            {pendingTasks.length === 0 ? (
              <p className="text-muted">No pending tasks</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: '#000000',
                      borderRadius: '8px',
                      padding: '20px',
                      width: '540px',
                      minHeight: '140px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: `1px solid ${task.isOverdue ? '#dc3545' : '#14b8a6'}`,
                      opacity: hoveredTask === task.id ? 0.9 : 1
                    }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                    onClick={() => handleViewDetails(task)}
                  >
                    <div>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: 'white',
                          margin: '0 0 8px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {task.task}
                      </h3>
                      <p
                        style={{
                          fontSize: '14px',
                          color: task.isOverdue ? '#dc3545' : '#14b8a6',
                          margin: '0 0 8px 0'
                        }}
                      >
                        Deadline: {new Date(task.deadline).toLocaleString()}
                        {task.isOverdue && ' (Overdue)'}
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(task);
                        }}
                      >
                        Mark as Complete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-gold">Under Review</h4>
            {completedTasks.length === 0 ? (
              <p className="text-muted">No tasks under review</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: '#000000',
                      borderRadius: '8px',
                      padding: '20px',
                      width: '540px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid #14b8a6'
                    }}
                    onClick={() => handleViewDetails(task)}
                  >
                    <div style={{ textAlign: 'center', width: '100%' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '500',
                          color: 'white',
                          margin: '0 0 8px 0',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {task.task}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#fbbf24',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        Under Admin Review
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedTask && (
        <CompletionModal
          task={selectedTask}
          onClose={handleCloseModal}
          onUpdate={refreshTasks}
        />
      )}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          onClose={handleCloseDetailModal}
        />
      )}
    </div>
  );
};

export default TodoList;