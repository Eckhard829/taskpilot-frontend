import React, { useState, useEffect } from 'react';

const CompletedWork = () => {
  const [submittedWork, setSubmittedWork] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmittedWork = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/work`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Show only submitted work (awaiting review) - approved work disappears
        const submittedTasks = data.filter(task => task.status === 'submitted');
        setSubmittedWork(submittedTasks);
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-gold mb-4">Submitted Work</h2>
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="text-gold">Submitted Work</h2>
          <small className="text-muted">Work you've submitted that's awaiting admin review</small>
        </div>
        <button 
          className="btn btn-outline-primary btn-sm" 
          onClick={fetchSubmittedWork}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      {submittedWork.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No work submitted for review. Once you complete and submit tasks, they'll appear here until reviewed by an admin.
        </div>
      ) : (
        <div className="list-group">
          {submittedWork.map(task => (
            <div key={task.id} className="list-group-item bg-light border-gold">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="mb-0">{task.task}</h5>
                    <span className="badge bg-warning text-dark">
                      <i className="bi bi-clock me-1"></i>
                      Awaiting Review
                    </span>
                  </div>
                  
                  {task.description && (
                    <div className="mb-2">
                      <strong className="text-gold">Description:</strong>
                      <div className="mt-1 p-2 bg-light rounded border-left-gold">
                        {task.description}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-2">
                    <strong className="text-gold">Instructions:</strong>
                    <div className="mt-1 p-2 bg-light rounded border-left-gold">
                      {task.instructions}
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <strong className="text-gold">Original Deadline:</strong>
                    <span className="ms-2">{formatDate(task.deadline)}</span>
                  </div>
                  
                  <div className="mb-2 text-success">
                    <strong>Submitted:</strong>
                    <span className="ms-2">{formatDate(task.submittedAt)}</span>
                  </div>
                  
                  {task.explanation && (
                    <div className="mb-2">
                      <strong className="text-gold">Your Work Notes:</strong>
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
                      <i className="bi bi-person-gear me-1"></i>
                      Assigned by: {task.assignedByUser?.name} ({task.assignedByUser?.email})
                    </small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          <strong>What happens next?</strong><br />
          Your submitted work is in the admin review queue. You'll receive an email notification once it's been reviewed. 
          If approved, the task will be marked as complete and disappear from this list. 
          If rejected, it will be returned to your "Work To Do" section with feedback.
        </div>
      </div>
    </div>
  );
};

export default CompletedWork;