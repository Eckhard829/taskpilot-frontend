import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const TaskDetailModal = ({ task, onClose }) => {
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
      return { class: 'text-red-300 bg-red-900', text: 'OVERDUE' };
    } else if (diffDays <= 1) {
      return { class: 'text-yellow-300 bg-yellow-900', text: 'DUE SOON' };
    } else {
      return { class: 'text-green-300 bg-green-900', text: 'ON TIME' };
    }
  };

  const deadlineStatus = getDeadlineStatus(task.deadline);

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      maxWidth: '95%',
      maxHeight: '90%',
      overflow: 'auto',
      backgroundColor: '#1f2937',
      border: 'none',
      borderRadius: '12px',
      padding: '0',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(4px)'
    }
  };

  return (
    <Modal isOpen={true} onRequestClose={onClose} style={modalStyles}>
      <div className="bg-gray-800 rounded-lg">
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Header - Task Details */}
          <h2 className="text-xl font-semibold text-white">Task Details</h2>
          
          {/* Title Label */}
          <h4 className="text-sm font-semibold text-gray-200">Title</h4>
          
          {/* Title Box */}
          <div 
            style={{ height: '60px' }}
            className="bg-gray-700 rounded-lg p-4 flex items-center"
          >
            <h3 className="text-lg font-medium text-white">{task.task}</h3>
          </div>

          {/* Description Label */}
          <h4 className="text-sm font-semibold text-gray-200">Description</h4>
          
          {/* Description Box */}
          <div 
            style={{ maxHeight: '120px' }}
            className="bg-gray-700 rounded-lg p-4 overflow-y-auto"
          >
            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">
              {task.description || 'No description provided'}
            </p>
          </div>

          {/* Instructions Label */}
          <h4 className="text-sm font-semibold text-gray-200">Instructions</h4>
          
          {/* Instructions Box */}
          <div 
            style={{ maxHeight: '120px' }}
            className="bg-blue-900 border border-blue-700 rounded-lg p-4 overflow-y-auto"
          >
            <p className="text-blue-200 whitespace-pre-wrap leading-relaxed">
              {task.instructions || 'No instructions provided'}
            </p>
          </div>

          {/* Assigned and Deadline Row */}
          <div className="flex space-x-8">
            {/* Assigned Column */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-200 mb-2">assigned</h4>
              <div className="text-sm text-gray-400">
                <div>{formatDate(task.assignedAt)}</div>
                {task.assignedByUser && (
                  <div>By: {task.assignedByUser.name}</div>
                )}
              </div>
            </div>
            
            {/* Deadline Column */}
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-200 mb-2">deadline</h4>
              <div className="text-sm text-gray-400">
                <div>{formatDate(task.deadline)}</div>
                <div className="text-xs">({deadlineStatus.text})</div>
              </div>
            </div>
          </div>

          {/* Status-specific information */}
          {task.status === 'rejected' && task.reviewNotes && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-300 mb-2">
                Admin Feedback - Revision Required
              </h4>
              <p className="text-red-200 whitespace-pre-wrap">{task.reviewNotes}</p>
            </div>
          )}

          {task.status === 'submitted' && (
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4">
              <p className="font-medium text-yellow-200">Work Submitted for Review</p>
              <p className="text-sm text-yellow-300">Your work is currently being reviewed by an administrator.</p>
            </div>
          )}

          {task.status === 'approved' && (
            <div className="bg-green-900 border border-green-700 rounded-lg p-4">
              <p className="font-medium text-green-200">Work Approved!</p>
              <p className="text-sm text-green-300">Great job! Your work has been approved.</p>
              {task.reviewNotes && (
                <p className="text-sm text-green-300 mt-1">Note: {task.reviewNotes}</p>
              )}
            </div>
          )}

          {/* Work submission details if available */}
          {(task.explanation || task.workLink) && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-200 mb-2">
                Your Submission
              </h4>
              {task.explanation && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1">Work Notes:</p>
                  <p className="text-gray-200 text-sm whitespace-pre-wrap">{task.explanation}</p>
                </div>
              )}
              {task.workLink && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Work Link:</p>
                  <a 
                    href={task.workLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    {task.workLink}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 bg-gray-700 rounded-b-lg border-t border-gray-600">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailModal;