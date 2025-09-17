// src/components/TaskForm.js
import React, { useState } from 'react';

const TaskForm = ({ workerId, workerEmail, onTaskAssigned }) => {
  const [task, setTask] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/work/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          workerId,
          task,
          description,
          instructions,
          deadline
        })
      });

      if (response.ok) {
        alert(`Task assigned successfully to ${workerEmail}!\nEmail notification sent.`);
        setTask('');
        setDescription('');
        setInstructions('');
        setDeadline('');
        if (onTaskAssigned) {
          onTaskAssigned();
        }
      } else {
        const error = await response.json();
        setError(`Error assigning task: ${error.message}`);
        alert(`Error assigning task: ${error.message}`);
      }
    } catch (error) {
      console.error('Error assigning task:', error);
      setError(`Network error: ${error.message}`);
      alert(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="border-top pt-3">
      <h5 className="mb-3 text-gold">Assign New Task to {workerEmail}</h5>
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Task Title:</label>
          <input 
            type="text" 
            className="form-control" 
            value={task} 
            onChange={e => setTask(e.target.value)} 
            placeholder="Brief title of the task..."
            required 
            disabled={loading}
            maxLength={200}
          />
          <small className="form-text text-muted">
            {task.length}/200 characters
          </small>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Description:</label>
          <textarea 
            className="form-control" 
            rows="3"
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Detailed description of what needs to be accomplished..."
            disabled={loading}
          />
          <small className="form-text text-muted">
            Provide a comprehensive overview of the task objectives
          </small>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Instructions:</label>
          <textarea 
            className="form-control" 
            rows="4"
            value={instructions} 
            onChange={e => setInstructions(e.target.value)} 
            placeholder="Step-by-step instructions on how to complete the task..."
            required 
            disabled={loading}
          />
          <small className="form-text text-muted">
            Provide clear, actionable steps for task completion
          </small>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Deadline:</label>
          <input 
            type="datetime-local" 
            className="form-control" 
            value={deadline} 
            onChange={e => setDeadline(e.target.value)} 
            min={minDateTime}
            required 
            disabled={loading}
          />
          <small className="form-text text-muted">
            Select both date and time for the deadline
          </small>
        </div>
        
        <div className="d-flex gap-2">
          <button 
            type="submit" 
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Assigning...' : 'Assign Task & Send Email'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;