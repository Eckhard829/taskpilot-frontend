// ReviewModal.js
import React, { useState } from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ReviewModal = ({ task, onClose, onUpdate }) => {
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/work/approve/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reviewNotes: reviewNotes || undefined
        })
      });

      if (response.ok) {
        onUpdate();
        onClose();
        alert('Work approved successfully!');
      } else {
        const error = await response.json();
        alert('Error approving work: ' + error.message);
      }
    } catch (error) {
      console.error('Error approving work:', error);
      alert('Error approving work: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      alert('Please provide feedback notes when rejecting work.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/work/reject/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          reviewNotes: reviewNotes
        })
      });

      if (response.ok) {
        onUpdate();
        onClose();
        alert('Work rejected. Task has been sent back to the worker.');
      } else {
        const error = await response.json();
        alert('Error rejecting work: ' + error.message);
      }
    } catch (error) {
      console.error('Error rejecting work:', error);
      alert('Error rejecting work: ' + error.message);
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
          <h5 className="modal-title text-gold">Review: {task.task}</h5>
          <button type="button" className="btn-close" onClick={onClose} disabled={loading}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <strong className="text-gold">Description:</strong>
            <div className="mt-2">{task.description}</div>
          </div>
          <div className="mb-3">
            <strong className="text-gold">Instructions:</strong>
            <div className="mt-2">{task.instructions}</div>
          </div>
          <div className="mb-3">
            <strong className="text-gold">Deadline:</strong>
            <div className="mt-2">{new Date(task.deadline).toLocaleString()}</div>
          </div>
          {task.explanation && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong className="text-gold">Worker's Notes:</strong>
              <div className="mt-2">{task.explanation}</div>
            </div>
          )}
          {task.workLink && (
            <div className="mb-3 p-3 bg-light rounded">
              <strong className="text-gold">Work Link:</strong>
              <div className="mt-2">
                <a
                  href={task.workLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold"
                >
                  <i className="bi bi-link-45deg me-1"></i>
                  {task.workLink}
                </a>
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="form-label">Review Notes (optional for approval, required for rejection):</label>
            <textarea
              className="form-control"
              rows="4"
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Provide feedback about the submitted work..."
              disabled={loading}
            />
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-outline-danger"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? 'Rejecting...' : 'Reject & Send Back'}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleApprove}
              disabled={loading}
            >
              {loading ? 'Approving...' : 'Approve Work'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewModal;