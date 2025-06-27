import React, { useState, useEffect } from 'react';
import { Town } from '../types';
import { ApiService } from '../services/api';

interface TownManagementProps {
  onClose: () => void;
  onTownsUpdated: () => void;
}

const TownManagement: React.FC<TownManagementProps> = ({ onClose, onTownsUpdated }) => {
  const [towns, setTowns] = useState<Town[]>([]);
  const [editingTown, setEditingTown] = useState<Town | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      onTownsUpdated();
    } catch (error) {
      console.error('Error saving town:', error);
    }
  };

  const handleEdit = (town: Town) => {
    setEditingTown(town);
    setTownName(town.name);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const town = towns.find(t => t.id === id);
    const townName = town ? town.name : 'Unknown Town';
    
    if (window.confirm(`Are you sure you want to delete this town: ${townName}? This may affect students assigned to this town.`)) {
      try {
        await ApiService.deleteTown(id);
        loadTowns();
        onTownsUpdated();
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

  return (
    <div className="town-management">
      <div className="management-header">
        <h2>Town Management</h2>
        <div className="header-buttons">
          <button onClick={handleNewTown} className="btn btn-primary">
            Add New Town
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Back to Students
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingTown ? 'Edit Town' : 'Add New Town'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Town Name:</label>
                <input
                  type="text"
                  value={townName}
                  onChange={(e) => setTownName(e.target.value)}
                  required
                  placeholder="Enter town name"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingTown ? 'Update' : 'Create'} Town
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading towns...</div>
        ) : (
          <table className="towns-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Town Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {towns.map(town => (
                <tr key={town.id}>
                  <td>{town.id}</td>
                  <td>{town.name}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(town)}
                      className="btn btn-small btn-primary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(town.id)}
                      className="btn btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {towns.length === 0 && !loading && (
          <div className="no-data">No towns found</div>
        )}
      </div>
    </div>
  );
};

export default TownManagement;
