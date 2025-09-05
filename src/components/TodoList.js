import React, { useState, useEffect } from 'react';
import CompletionModal from './CompletionModal';
import TaskDetailModal from './TaskDetailModal';

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/work`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        console.error('Error fetching tasks');
        alert('Error fetching tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Error fetching tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskClick = (task) => {
    setDetailTask(task);
  };

  const handleMarkDone = (e, task) => {
    e.stopPropagation();
    setDetailTask(null);
  };

  const handleBubbleClick = (e, task) => {
    e.stopPropagation();
    setSelectedTask(task);
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

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let urgencyClass = '';
    let urgencyText = '';
    
    if (diffDays < 0) {
      urgencyClass = 'text-red-400';
      urgencyText = ' (OVERDUE)';
    } else if (diffDays <= 1) {
      urgencyClass = 'text-yellow-400';
      urgencyText = ' (DUE SOON)';
    } else {
      urgencyClass = 'text-green-400';
    }
    
    return {
      formatted: date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      urgencyClass,
      urgencyText
    };
  };

  // Separate tasks by status
  const pendingTasks = tasks.filter(task => 
    task.status === 'pending' || task.status === 'rejected'
  );
  const completedTasks = tasks.filter(task => 
    task.status === 'submitted' || task.status === 'approved'
  );

  const TaskCard = ({ task, showBubble = true }) => {
    const deadlineInfo = formatDeadline(task.deadline);
    const isHovered = hoveredTask === task.id;

    return (
      <div 
        className="relative bg-gray-800 rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-700 transition-colors border border-gray-600"
        onMouseEnter={() => setHoveredTask(task.id)}
        onMouseLeave={() => setHoveredTask(null)}
        onClick={() => handleTaskClick(task)}
      >
        {/* Completion Bubble - NO ICON */}
        {showBubble && isHovered && (
          <div 
            className="absolute -left-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-400 z-10 shadow-lg"
            onClick={(e) => handleBubbleClick(e, task)}
            title="Mark as complete"
          >
            ✓
          </div>
        )}

        <div className="flex flex-col">
          <h3 className="text-white font-medium text-lg mb-2 leading-tight">
            {task.task}
          </h3>
          
          <div className={`text-sm ${deadlineInfo.urgencyClass || 'text-gray-400'}`}>
            Due: {deadlineInfo.formatted}{deadlineInfo.urgencyText}
          </div>

          {/* Status badges for completed tasks */}
          {task.status === 'submitted' && (
            <div className="mt-2">
              <span className="px-2 py-1 bg-yellow-600 text-yellow-100 rounded-full text-xs font-medium">
                Under Review
              </span>
            </div>
          )}
          {task.status === 'approved' && (
            <div className="mt-2">
              <span className="px-2 py-1 bg-green-600 text-green-100 rounded-full text-xs font-medium">
                Approved
              </span>
            </div>
          )}
          {task.status === 'rejected' && (
            <div className="mt-2">
              <span className="px-2 py-1 bg-red-600 text-red-100 rounded-full text-xs font-medium">
                Needs Revision
              </span>
              {task.reviewNotes && (
                <div className="mt-2 p-2 bg-red-900 bg-opacity-30 border border-red-600 rounded text-xs text-red-300">
                  <strong>Feedback:</strong> {task.reviewNotes}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Updated TaskDetailModal with Done button - NO ICONS
  const TaskDetailModalWithDone = ({ task, onClose, onDone }) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    const getDeadlineStatus = (deadline) => {
      const date = new Date(deadline);
      const now = new Date();
      const diffTime = date - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { class: 'text-red-400 bg-red-900 bg-opacity-30', text: 'OVERDUE', icon: '⚠️' };
      } else if (diffDays <= 1) {
        return { class: 'text-yellow-400 bg-yellow-900 bg-opacity-30', text: 'DUE SOON', icon: '⏰' };
      } else {
        return { class: 'text-green-400 bg-green-900 bg-opacity-30', text: 'ON TIME', icon: '✓' };
      }
    };

    const deadlineStatus = getDeadlineStatus(task.deadline);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50" onClick={onClose}>
        <div className="bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border-2 border-teal-500" onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                📋
              </div>
              <h2 className="text-xl font-semibold text-white">Task Details</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-700 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Task Title */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{task.task}</h3>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <h4 className="text-sm font-semibold text-teal-400 mb-2 flex items-center">
                  Description
                </h4>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{task.description}</p>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-2 flex items-center">
                Steps to Complete
              </h4>
              <div className="bg-gray-700 border border-teal-600 rounded-lg p-4">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{task.instructions}</p>
              </div>
            </div>

            {/* Deadline */}
            <div>
              <h4 className="text-sm font-semibold text-teal-400 mb-2 flex items-center">
                Deadline
              </h4>
              <div className={`inline-flex items-center px-4 py-2 rounded-lg font-medium ${deadlineStatus.class}`}>
                <span className="mr-2">{deadlineStatus.icon}</span>
                <span>{formatDate(task.deadline)}</span>
                <span className="ml-2 text-xs">({deadlineStatus.text})</span>
              </div>
            </div>

            {/* Rejection feedback if applicable */}
            {task.status === 'rejected' && task.reviewNotes && (
              <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center">
                  Admin Feedback - Revision Required
                </h4>
                <p className="text-red-300 whitespace-pre-wrap">{task.reviewNotes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-700 rounded-b-lg border-t border-gray-600">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-500 transition-colors"
            >
              Close
            </button>
            {(task.status === 'pending' || task.status === 'rejected') && (
              <button 
                onClick={() => onDone(task)}
                className="px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors flex items-center"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
          <div className="text-white">Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-8 justify-center">
          
          {/* Left Column - Tasks to Complete */}
          <div 
            className="bg-gray-900 rounded-xl shadow-lg border-2 border-teal-500 p-6" 
            style={{ width: '644px', height: '396px' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                Work To Be Done
              </h2>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-400">{pendingTasks.length} tasks</span>
                <button 
                  onClick={refreshTasks}
                  className="p-2 text-gray-400 hover:text-white transition-colors"
                  title="Refresh tasks"
                >
                  ↻
                </button>
              </div>
            </div>
            
            <div className="h-72 overflow-y-auto">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 text-gray-600 mx-auto mb-4 text-6xl">✓</div>
                  <p className="text-gray-400 font-medium">No pending tasks!</p>
                  <p className="text-gray-500 text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {pendingTasks.map(task => (
                    <TaskCard key={task.id} task={task} showBubble={true} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Completed Work */}
          <div 
            className="bg-gray-900 rounded-xl shadow-lg border-2 border-teal-500 p-6" 
            style={{ width: '644px', height: '396px' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                Completed Work
              </h2>
              <span className="text-sm text-gray-400">{completedTasks.length} tasks</span>
            </div>
            
            <div className="h-72 overflow-y-auto">
              {completedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 font-medium">No completed work yet</p>
                  <p className="text-gray-500 text-sm">Finished tasks will appear here</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {completedTasks.map(task => (
                    <TaskCard key={task.id} task={task} showBubble={false} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Completion Modal */}
      {selectedTask && (
        <CompletionModal 
          task={selectedTask} 
          onClose={handleCloseModal} 
          onUpdate={refreshTasks} 
        />
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <TaskDetailModalWithDone 
          task={detailTask} 
          onClose={handleCloseDetailModal}
          onDone={handleMarkDone}
        />
      )}
    </div>
  );
};

export default TodoList;