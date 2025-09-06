import React, { useState } from 'react';

const CreateUser = ({ onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'worker'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Creating user:', formData);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      console.log('Create user response status:', response.status);
      
      const data = await response.json();
      console.log('Create user response data:', data);

      if (response.ok) {
        alert(`User "${formData.name}" created successfully!`);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'worker'
        });
        if (onUserCreated) {
          onUserCreated();
        }
      } else {
        setError(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Name *</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter full name"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
            placeholder="Enter email address"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password *</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter password"
              minLength={6}
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={generatePassword}
              disabled={loading}
              title="Generate random password"
            >
              <i className="bi bi-dice-3"></i>
            </button>
          </div>
          <small className="form-text text-muted">
            Minimum 6 characters. Click the dice to generate a random password.
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Role *</label>
          <select
            className="form-select"
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="worker">Worker</option>
            <option value="admin">Administrator</option>
          </select>
          <small className="form-text text-muted">
            Workers can complete tasks. Administrators can assign tasks and manage workers.
          </small>
        </div>

        <div className="d-flex gap-2">
          <button
            type="submit"
            className="btn btn-success flex-fill"
            disabled={loading || !formData.name || !formData.email || !formData.password}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Creating...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus me-1"></i>
                Create User
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-4 p-3 bg-light rounded">
        <h6 className="text-teal">User Creation Notes:</h6>
        <ul className="mb-0 small text-muted">
          <li>New users will receive their login credentials</li>
          <li>Workers can log in and view/complete assigned tasks</li>
          <li>Administrators have full system access</li>
          <li>Email notifications will be sent for task assignments</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateUser;