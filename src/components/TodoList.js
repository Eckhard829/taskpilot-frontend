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

  const refreshTasks = () => {
    fetchTasks();
  };

  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'rejected');
  const completedTasks = tasks.filter(task => task.status === 'submitted' || task.status === 'approved');

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="spinner-border text-teal-500" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-gray-400 mt-2">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          onClick={fetchTasks}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#333333', minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        gap: '20px',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        
        {/* Left Block - Work to be Done */}
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          border: '2px solid #14b8a6',
          padding: '24px',
          width: '600px',
          height: '600px',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
              📋 Work to be Done
            </h2>
            <span style={{ 
              fontSize: '14px', 
              color: '#9ca3af', 
              backgroundColor: '#374151', 
              padding: '4px 8px', 
              borderRadius: '4px' 
            }}>
              {pendingTasks.length} tasks
            </span>
          </div>
          <div style={{ height: '500px', overflowY: 'auto' }}>
            {pendingTasks.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <p style={{ color: '#9ca3af', fontWeight: '500', margin: '8px 0' }}>No tasks assigned</p>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>You're all caught up!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {pendingTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: '#374151',
                      borderRadius: '8px',
                      padding: '20px',
                      width: '540px',
                      height: '60px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid #4b5563',
                      position: 'relative'
                    }}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                  >
                    <h3 
                      style={{ 
                        fontSize: '18px', 
                        fontWeight: '500', 
                        color: 'white', 
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center'
                      }}
                      onClick={() => handleViewDetails(task)}
                    >
                      {task.task}
                    </h3>
                    
                    {hoveredTask === task.id && (
                      <div
                        style={{
                          position: 'absolute',
                          right: '20px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          backgroundColor: '#10b981',
                          borderRadius: '50%',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleComplete(task);
                        }}
                        title="Mark as complete"
                      >
                        <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Block - Completed Work */}
        <div style={{
          backgroundColor: '#1f2937',
          borderRadius: '12px',
          border: '2px solid #14b8a6',
          padding: '24px',
          width: '600px',
          height: '600px',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>
              ✅ Completed Work
            </h2>
            <span style={{ 
              fontSize: '14px', 
              color: '#9ca3af', 
              backgroundColor: '#374151', 
              padding: '4px 8px', 
              borderRadius: '4px' 
            }}>
              {completedTasks.length} tasks
            </span>
          </div>
          <div style={{ height: '500px', overflowY: 'auto' }}>
            {completedTasks.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                <p style={{ color: '#9ca3af', fontWeight: '500', margin: '8px 0' }}>No completed work yet</p>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Finished tasks will appear here</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {completedTasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      backgroundColor: '#374151',
                      borderRadius: '8px',
                      padding: '20px',
                      width: '600px',
                      height: '111px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: '1px solid #4b5563'
                    }}
                    onClick={() => handleViewDetails(task)}
                  >
                    <h3 
                      style={{ 
                        fontSize: '18px', 
                        fontWeight: '500', 
                        color: 'white', 
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center'
                      }}
                    >
                      {task.task}
                    </h3>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
      </div>

      {/* Modals */}
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