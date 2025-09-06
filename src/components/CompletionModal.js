// components/CompletionModal.js - Complete file
import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const CompletionModal = ({ task, onClose, onUpdate }) => {
  const [explanation, setExplanation] = useState('');
  const [workLink, setWorkLink] = useState('');
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!explanation.trim()) {
      alert('Please provide a description of the work you completed.');
      return;
    }

    setLoading(true);

    try {
      console.log('=== TASK COMPLETION DEBUG ===');
      console.log('Task ID:', task.id);
      console.log('API URL:', process.env.REACT_APP_API_URL);
      
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        alert('Authentication token missing. Please log in again.');
        window.location.href = '/';
        return;
      }
      
      const requestBody = {
        explanation: explanation.trim(),
        workLink: workLink.trim() || null
      };
      
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`${process.env.REACT_APP_API_URL}/work/complete/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        responseData = { message: 'Server returned invalid response' };
      }
      
      console.log('Response data:', responseData);

      if (response.ok) {
        console.log('Task completion successful');
        onUpdate();
        onClose();
        alert('Work submitted for review successfully!');
      } else {
        console.error('Task completion failed:', responseData);
        
        let errorMessage = 'Unknown error occurred';
        
        switch (response.status) {
          case 400:
            errorMessage = responseData.message || 'Invalid request. Please check your input.';
            break;
          case 401:
            errorMessage = 'Authentication failed. Please log in again.';
            localStorage.removeItem('token');
            setTimeout(() => window.location.href = '/', 2000);
            break;
          case 403:
            errorMessage = 'Access denied. You may not have permission to complete this task.';
            break;
          case 404:
            errorMessage = 'Task not found. It may have been deleted.';
            break;
          case 409:
            errorMessage = 'Task is already being processed. Please refresh and try again.';
            break;
          case 500:
            errorMessage = `Server error: ${responseData.message || responseData.error || 'Internal server error'}`;
            console.error('Full server error response:', responseData);
            break;
          default:
            errorMessage = responseData.message || `HTTP ${response.status}: ${response.statusText}`;
        }
        
        alert('Error submitting work: ' + errorMessage);
      }
    } catch (error) {
      console.error('Network/Request error:', error);
      
      let errorMessage = 'Network error occurred';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Request was cancelled. Please try again.';
      } else {
        errorMessage = `Network error: ${error.message}`;
      }
      
      alert('Error submitting work: ' + errorMessage);
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
      maxWidth: '95%',
      maxHeight: '90%',
      overflow: 'auto',
      backgroundColor: '#1f2937',
      border: '1px solid #14b8a6',
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
      <div className="bg-gray-800 rounded-lg text-white">
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white">Submit Completed Work</h2>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-200 rounded-full hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 bg-gray-700 border-b border-gray-600">
          <h3 className="font-semibold text-blue-200 mb-2">{task.task}</h3>
          {task.description && (
            <p className="text-gray-300 text-sm mb-2">{task.description}</p>
          )}
          <div className="text-xs text-gray-400">
            <span className="font-medium">Deadline:</span> {formatDate(task.deadline)}
          </div>
          {task.status === 'rejected' && task.reviewNotes && (
            <div className="mt-3 p-3 bg-red-900 border border-red-700 rounded-lg">
              <h4 className="text-red-200 font-medium text-sm mb-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                Previous Feedback:
              </h4>
              <p className="text-red-300 text-sm">{task.reviewNotes}</p>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Describe what you completed <span className="text-red-400">*</span>
              </label>
              <textarea 
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                rows="5"
                value={explanation} 
                onChange={e => setExplanation(e.target.value)}
                placeholder="Describe the work you completed, any challenges you faced, and how you addressed them..."
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Provide details about what you accomplished and any relevant notes for the reviewer.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-200 mb-2">
                Link to your work (optional)
              </label>
              <input 
                type="url" 
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                value={workLink} 
                onChange={e => setWorkLink(e.target.value)}
                placeholder="https://example.com/your-work"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional: Provide a link to your completed work (document, website, etc.)
              </p>
            </div>
            
            <div className="bg-blue-900 border border-blue-700 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-sm">
                  <p className="text-blue-200 font-medium mb-1">What happens next?</p>
                  <p className="text-blue-300">
                    Your work will be submitted for admin review. You'll receive an email notification once it's been reviewed and approved or if changes are requested.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-700 rounded-b-lg border-t border-gray-600">
          <button 
            type="button" 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-600 border border-gray-500 rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || !explanation.trim()}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit for Review
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CompletionModal;