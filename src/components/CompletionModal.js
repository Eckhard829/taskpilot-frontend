import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const CompletionModal = ({ task, onClose, onUpdate }) => {
  const [explanation, setExplanation] = useState('');
  const [workLink, setWorkLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!explanation.trim()) {
      alert('Please provide an explanation of your completed work.');
      return;
    }

    setLoading(true);
    
    try {
      console.log('Submitting task completion for ID:', task.id);
      console.log('Explanation:', explanation);
      console.log('Work Link:', workLink);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/work/complete/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          explanation: explanation.trim(),
          workLink: workLink.trim() || undefined
        })
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success result:', result);
        onUpdate();
        onClose();
        alert('Task submitted for review successfully!');
      } else {
        const error = await response.json();
        console.error('Error response:', error);
        alert('Error submitting task: ' + error.message);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const modalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '600px',
      maxWidth: '90%',
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
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-600">
          <h2 className="text-xl font-semibold text-white">Complete Task</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Task Info */}
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-medium text-white mb-2">{task.task}</h3>
            {task.description && (
              <p className="text-gray-300 text-sm mb-2">{task.description}</p>
            )}
            <p className="text-gray-400 text-sm">
              <span className="font-medium">Deadline:</span> {new Date(task.deadline).toLocaleDateString()} at {new Date(task.deadline).toLocaleTimeString()}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Work Explanation <span className="text-red-400">*</span>
                </label>
                <textarea 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows="5"
                  value={explanation} 
                  onChange={e => setExplanation(e.target.value)}
                  placeholder="Describe what you accomplished, how you completed the task, and any important details..."
                  required 
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  Provide a detailed explanation of your completed work.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  Work Link (Optional)
                </label>
                <input 
                  type="url" 
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  value={workLink} 
                  onChange={e => setWorkLink(e.target.value)}
                  placeholder="https://example.com/my-completed-work"
                  disabled={loading}
                />
                <p className="text-xs text-gray-400 mt-1">
                  If applicable, provide a link to your completed work (document, website, etc.)
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-600">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-500 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-teal-600 rounded-lg hover:bg-teal-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !explanation.trim()}
              >
                {loading ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default CompletionModal;