// CompletionModal.js
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

      if (response.ok) {
        onUpdate();
        onClose();
        alert('Task submitted for review successfully!');
      } else {
        const error = await response.json();
        alert('Error submitting task: ' + error.message);
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={onClose}
      style={{
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
          backgroundColor: '#000000',
          border: '2px solid #00A3AD',
          borderRadius: '12px',
          padding: '0'
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)'
        }
      }}
    >
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title text-gold">Submit Completed Work: {task.task}</h5>
          <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label">Work Notes</label>
              <textarea
                className="form-control"
                rows="5"
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Describe the work you completed..."
                required
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                Provide a detailed explanation of your completed work.
              </p>
            </div>
            <div>
              <label className="form-label">Work Link (Optional)</label>
              <input
                type="url"
                className="form-control"
                value={workLink}
                onChange={e => setWorkLink(e.target.value)}
                placeholder="https://example.com/my-completed-work"
                disabled={loading}
              />
              <p className="text-xs text-gray-400 mt-1">
                If applicable, provide a link to your completed work (document, website, etc.)
              </p>
            </div>
            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-600">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
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