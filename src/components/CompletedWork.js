import React, { useState, useEffect } from 'react';

const CompletedWork = () => {
  const [approvedWork, setApprovedWork] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovedWork = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/work`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Show only approved work (completed and approved by admin)
        const approvedTasks = data.filter(task => task.status === 'approved');
        setApprovedWork(approvedTasks);
      } else {
        console.error('Error fetching approved work');
        alert('Error fetching approved work');
      }
    } catch (error) {
      console.error('Error fetching approved work:', error);
      alert('Error fetching approved work: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedWork();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-gold mb-4">Completed Work</h2>
        <div className="text-center">
          <div className="spinner-border text-gold" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="mt-2">Loading completed work...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="text-gold">Completed Work</h2>
          <small className="text-muted">All approved and completed tasks</small>
        </div>
        <button 
          className="btn btn-outline-primary btn-sm" 
          onClick={fetchApprovedWork}
          disabled={loading}
        >
          <i className="bi bi-arrow-clockwise me-1"></i>
          Refresh
        </button>
      </div>

      {approvedWork.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No completed work found. Tasks that have been reviewed and approved will appear here.
        </div>
      ) : (
        <div>
          <div className="mb-3">
            <small className="text-muted">
              <i className="bi bi-check-circle me-1"></i>
              {approvedWork.length} completed task{approvedWork.length !== 1 ? 's' : ''}
            </small>
          </div>
          <div className="list-group">
            {approvedWork.map(task => (
              <div key={task.id} className="list-group-item bg-light border-gold">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="mb-0 text-gold">{task.task}</h5>
                      <span className="badge bg-success text-white">
                        <i className="bi bi-check-circle me-1"></i>
                        Completed
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
                    
                    <div className="mb-2">
                      <strong className="text-gold">Submitted:</strong>
                      <span className="ms-2">{formatDate(task.submittedAt)}</span>
                    </div>
                    
                    <div className="mb-2 text-success">
                      <strong>Approved:</strong>
                      <span className="ms-2">{formatDate(task.reviewedAt)}</span>
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
                    
                    {task.reviewNotes && (
                      <div className="mb-2">
                        <strong className="text-gold">Review Notes:</strong>
                        <div className="mt-1 p-2 bg-success bg-opacity-10 rounded border-left-teal">
                          {task.reviewNotes}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-muted">
                      <small>
                        <i className="bi bi-person me-1"></i>
                        Worker: {task.worker?.name} ({task.worker?.email})
                      </small>
                      <br />
                      <small>
                        <i className="bi bi-person-gear me-1"></i>
                        Approved by: {task.reviewedByUser?.name} ({task.reviewedByUser?.email})
                      </small>
                      <br />
                      <small>
                        <i className="bi bi-person-plus me-1"></i>
                        Originally assigned by: {task.assignedByUser?.name} ({task.assignedByUser?.email})
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedWork;