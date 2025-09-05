import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('defaultPass123');
  const [role, setRole] = useState('worker');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `User created successfully!\nName: ${result.user.name}\nEmail: ${result.user.email}\nTemporary password: ${password}\n\nPlease share these credentials with the user.`
        );
        navigate('/admin');
      } else {
        const error = await response.json();
        alert('Creation failed: ' + error.message);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Creation failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title">Create New User</h2>
              
              <form onSubmit={handleCreate}>
                <div className="mb-3">
                  <label className="form-label">Full Name:</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="Enter full name"
                    required 
                    disabled={loading}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Email:</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Enter email address"
                    required 
                    disabled={loading}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Temporary Password:</label>
                  <div className="input-group">
                    <input 
                      type="text" 
                      className="form-control" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      required 
                      disabled={loading}
                    />
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={generateRandomPassword}
                      disabled={loading}
                    >
                      Generate
                    </button>
                  </div>
                  <small className="form-text text-muted">
                    This temporary password will be shared with the user
                  </small>
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Role:</label>
                  <select 
                    className="form-control" 
                    value={role} 
                    onChange={e => setRole(e.target.value)}
                    disabled={loading}
                  >
                    <option value="worker">Worker</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create User'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => navigate('/admin')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;