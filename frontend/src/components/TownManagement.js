import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';

const TownManagement = ({ onClose, onTownsUpdated }) => {
  const [towns, setTowns] = useState([]);
  const [editingTown, setEditingTown] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [townName, setTownName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTowns();
  }, []);

  const loadTowns = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getTowns();
      setTowns(data);
    } catch (error) {
      console.error('Error loading towns:', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTown) {
        await ApiService.updateTown(editingTown.id, { name: townName });
      } else {
        await ApiService.createTown({ name: townName });
      }
      
      setShowForm(false);
      setEditingTown(null);
      setTownName('');
      loadTowns();
      if (onTownsUpdated) onTownsUpdated();
    } catch (error) {
      console.error('Error saving town:', error);
    }
  };

  const handleEdit = (town) => {
    setEditingTown(town);
    setTownName(town.name);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const town = towns.find(t => t.id === id);
    const townName = town ? town.name : 'Unknown Town';
    
    if (window.confirm(`Are you sure you want to delete this town: ${townName}?`)) {
      try {
        await ApiService.deleteTown(id);
        loadTowns();
        if (onTownsUpdated) onTownsUpdated();
      } catch (error) {
        console.error('Error deleting town:', error);
      }
    }
  };

  const handleNewTown = () => {
    setEditingTown(null);
    setTownName('');
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTown(null);
    setTownName('');
  };

  if (loading) {
    return <div className="loading">Loading towns...</div>;
  }

  return (
    <div className="town-management">
      {/* Add/Edit Town Form */}
      {showForm && (
        <div className="town-form-section">
          <h4>{editingTown ? 'Edit Town' : 'Add New Town'}</h4>
          <form onSubmit={handleSubmit} className="town-form">
            <div className="form-group">
              <label>Town Name*:</label>
              <input
                type="text"
                value={townName}
                onChange={(e) => setTownName(e.target.value)}
                required
                placeholder="Enter town name"
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingTown ? 'Update' : 'Create'} Town
              </button>
              <button 
                type="button" 
                onClick={handleCancelForm}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Town Button */}
      {!showForm && (
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={handleNewTown} className="btn btn-primary">
            Add New Town
          </button>
        </div>
      )}

      {/* Towns List */}
      <div className="towns-list">
        <h4>Existing Towns ({towns.length})</h4>
        <div className="towns-table-container">
          <table className="towns-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {towns.map((town) => (
                <tr key={town.id}>
                  <td>{town.id}</td>
                  <td>{town.name}</td>
                  <td>
                    <div className="table-actions">
                      <button
                        onClick={() => handleEdit(town)}
                        className="btn btn-sm btn-primary"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(town.id)}
                        className="btn btn-sm btn-danger"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {towns.length === 0 && (
            <div className="no-data">
              <p>No towns found. Click "Add New Town" to create one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TownManagement;
