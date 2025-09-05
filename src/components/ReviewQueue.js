import React, { useState, useEffect } from 'react';
import ReviewModal from './ReviewModal';

const ReviewQueue = () => {
  const [submittedWork, setSubmittedWork] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubmittedWork = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/work/submitted`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSubmittedWork(data);
      } else {
        console.error('Error fetching submitted work');
        alert('Error fetching submitted work');
      }
    } catch (error) {
      console.error('Error fetching submitted work:', error);
      alert('Error fetching submitted work: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmittedWork();
  }, []);

  const handleReview = (task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const refreshQueue = () => {
    fetchSubmittedWork();
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let urgencyClass = '';
    let urgencyText = '';
    
    if (diffDays < 0) {
      urgencyClass = 'text-danger';
      urgencyText = ' (WAS OVERDUE)';
    } else if (diffDays <= 1) {
      urgencyClass = 'text-warning';
      urgencyText = ' (WAS DUE SOON)';
    }
    
    return {
      formatted: date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      urgencyClass,
      urgencyText
    };
  };

  const formatSubmittedDate = (submittedAt) => {
    const date = new Date(submittedAt);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-gold mb-4">Review Queue</h2>
        <div className="text-center">
          <div className="spinner-border text-gold" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading submitted work...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-gold mb-0">Review Queue</h2>
        <button 
          className="btn btn-outline-primary btn-sm" 
          onClick={fetchSubmittedWork}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>
      
      {submittedWork.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No work submitted for review at this time.
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="mb-3">
              <small className="text-muted">
                {submittedWork.length} work item{submittedWork.length !== 1 ? 's' : ''} waiting for review
              </small>
            </div>
            <div className="list-group">
              {submittedWork.map(task => {
                const deadlineInfo = formatDeadline(task.deadline);
                return (
                  <div key={task.id} className="list-group-item">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h5 className="mb-0 text-gold">{task.task}</h5>
                          <span className="badge bg-warning text-dark">
                            Submitted for Review
                          </span>
                        </div>
                        
                        {task.description && (
                          <div className="mb-2">
                            <strong className="text-gold">Description:</strong>
                            <div className="mt-1 p-2 bg-light rounded">
                              {task.description}
                            </div>
                          </div>
                        )}
                        
                        <div className="mb-2">
                          <strong className="text-gold">Instructions:</strong>
                          <div className="mt-1 p-2 bg-light rounded">
                            {task.instructions}
                          </div>
                        </div>
                        
                        <div className={`mb-2 ${deadlineInfo.urgencyClass}`}>
                          <i className="bi bi-calendar-event me-1"></i>
                          <strong>Original Deadline:</strong> {deadlineInfo.formatted}{deadlineInfo.urgencyText}
                        </div>
                        
                        <div className="mb-2 text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          <strong>Submitted:</strong> {formatSubmittedDate(task.submittedAt)}
                        </div>
                        
                        {task.explanation && (
                          <div className="mb-2">
                            <strong className="text-gold">Worker's Notes:</strong>
                            <div className="mt-1 p-2 bg-light rounded border-left-gold">
                              {task.explanation}
                            </div>
                          </div>
                        )}
                        
                        {task.workLink && (
                          <div className="mb-2">
                            <strong className="text-gold">Work Link:</strong>
                            <div className="mt-1">
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
                        
                        <div className="text-muted">
                          <small>
                            <i className="bi bi-person me-1"></i>
                            Worker: {task.worker?.name} ({task.worker?.email})
                          </small>
                        </div>
                      </div>
                      
                      <div className="ms-3">
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleReview(task)}
                        >
                          <i className="bi bi-eye me-1"></i>
                          Review Work
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {selectedTask && (
        <ReviewModal 
          task={selectedTask} 
          onClose={handleCloseModal} 
          onUpdate={refreshQueue} 
        />
      )}
    </div>
  );
};

export default ReviewQueue;