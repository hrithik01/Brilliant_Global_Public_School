import React, { useState, useEffect } from 'react';
import { CLASSES, GENDERS, HOUSES } from '../types';
import { ApiService } from '../services/api';
import TownManagement from './TownManagement';

const StudentManagement = React.memo(() => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [towns, setTowns] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showTownManagement, setShowTownManagement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingStudent, setViewingStudent] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    class: '',
    town_id: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    dob: '',
    class: 'Nursery',
    parents_name: '',
    contact_info: '',
    town_id: '',
    house: 'All',
    fees_total: '',
    is_bus_service_opted: false,
    bus_fees_amount: '',
    course_fees_amount: '',
    remarks: ''
  });

  useEffect(() => {
    loadStudents();
    loadTowns();
  }, []);

  // Filter students whenever students or filters change
  useEffect(() => {
    let filtered = [...students];
    
    if (filters.class) {
      filtered = filtered.filter(student => student.class === filters.class);
    }
    
    if (filters.town_id) {
      filtered = filtered.filter(student => student.town_id === parseInt(filters.town_id));
    }
    
    setFilteredStudents(filtered);
  }, [students, filters]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await ApiService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    }
    setLoading(false);
  };

  const loadTowns = async () => {
    try {
      const data = await ApiService.getTowns();
      setTowns(data);
    } catch (error) {
      console.error('Error loading towns:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const studentData = {
      ...formData,
      town_id: parseInt(formData.town_id),
      fees_total: formData.fees_total ? parseInt(formData.fees_total) : null,
      is_bus_service_opted: formData.is_bus_service_opted,
      bus_fees_amount: formData.bus_fees_amount ? parseInt(formData.bus_fees_amount) : 0,
      course_fees_amount: formData.course_fees_amount ? parseInt(formData.course_fees_amount) : 0,
      remarks: formData.remarks || ''
    };

    try {
      if (editingStudent) {
        await ApiService.updateStudent(editingStudent.id, studentData);
      } else {
        await ApiService.createStudent(studentData);
      }
      
      setShowForm(false);
      setEditingStudent(null);
      resetForm();
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      gender: student.gender,
      dob: student.dob,
      class: student.class,
      parents_name: student.parents_name,
      contact_info: student.contact_info,
      town_id: student.town_id.toString(),
      house: student.house,
      fees_total: student.fees_total?.toString() || '',
      is_bus_service_opted: student.is_bus_service_opted || false,
      bus_fees_amount: student.bus_fees_amount?.toString() || '',
      course_fees_amount: student.course_fees_amount?.toString() || '',
      remarks: student.remarks || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const student = students.find(s => s.id === id);
    const studentName = student ? student.name : 'Unknown Student';
    
    if (window.confirm(`Are you sure you want to delete this student: ${studentName}?`)) {
      try {
        await ApiService.deleteStudent(id);
        loadStudents();
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: 'Male',
      dob: '',
      class: 'Nursery',
      parents_name: '',
      contact_info: '',
      town_id: '',
      house: 'All',
      fees_total: '',
      is_bus_service_opted: false,
      bus_fees_amount: '',
      course_fees_amount: '',
      remarks: ''
    });
  };

  const handleNewStudent = () => {
    setEditingStudent(null);
    resetForm();
    setShowForm(true);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleOverlayClick = (e, closeFunction) => {
    if (e.target === e.currentTarget) {
      closeFunction();
    }
  };

  const handleViewDetails = (student) => {
    setViewingStudent(student);
  };

  const getAvailableBalance = (student) => {
    const totalFees = student.fees_total || 0;
    const paidFees = student.total_fees_paid || 0;
    return totalFees - paidFees;
  };

  const getStatusColor = (student) => {
    const balance = getAvailableBalance(student);
    if (balance <= 0) return 'status-paid';
    if (balance > 0 && student.total_fees_paid > 0) return 'status-partial';
    return 'status-unpaid';
  };

  const getStatusText = (student) => {
    const balance = getAvailableBalance(student);
    if (balance <= 0) return 'Paid';
    if (balance > 0 && student.total_fees_paid > 0) return 'Partial';
    return 'Unpaid';
  };

  if (loading) {
    return <div className="loading">Loading students...</div>;
  }

  return (
    <div className="student-management">
      <div className="management-header">
        <h2>Student Management</h2>
        <div className="header-actions">
          <button onClick={handleNewStudent} className="btn btn-primary">
            Add New Student
          </button>
          <button 
            onClick={() => setShowTownManagement(true)}
            className="btn btn-secondary"
          >
            Manage Towns
          </button>
        </div>
      </div>

      {/* Town Management Modal */}
      {showTownManagement && (
        <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, () => setShowTownManagement(false))}>
          <div className="modal">
            <div className="modal-header">
              <h3>Town Management</h3>
              <button 
                className="close-btn"
                onClick={() => setShowTownManagement(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <TownManagement onClose={() => setShowTownManagement(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Student Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, () => setShowForm(false))}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="student-form">
              <div className="form-container">
              <div className="form-row">
                <div className="form-group">
                  <label>Name*:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    maxLength={100}
                    placeholder="Enter student name"
                  />
                </div>

                <div className="form-group">
                  <label>Gender*:</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                    required
                  >
                    {GENDERS.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date of Birth*:</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Class*:</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value})}
                    required
                  >
                    {CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Town*:</label>
                  <select
                    value={formData.town_id}
                    onChange={(e) => setFormData({...formData, town_id: e.target.value})}
                    required
                  >
                    <option value="">Select Town</option>
                    {towns.map((town) => (
                      <option key={town.id} value={town.id}>
                        {town.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>House:</label>
                  <select
                    value={formData.house}
                    onChange={(e) => setFormData({...formData, house: e.target.value})}
                  >
                    {HOUSES.map((house) => (
                      <option key={house} value={house}>
                        {house}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Parents Name*:</label>
                  <input
                    type="text"
                    value={formData.parents_name}
                    onChange={(e) => setFormData({...formData, parents_name: e.target.value})}
                    required
                    placeholder="Enter parents name"
                  />
                </div>

                <div className="form-group">
                  <label>Contact Info*:</label>
                  <input
                    type="text"
                    value={formData.contact_info}
                    onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                    required
                    placeholder="Enter contact information"
                  />
                </div>

                <div className="form-group">
                  <label>Total Fees (₹):</label>
                  <input
                    type="number"
                    value={formData.fees_total}
                    onChange={(e) => setFormData({...formData, fees_total: e.target.value})}
                    min="0"
                    placeholder="Enter total fees"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_bus_service_opted}
                      onChange={(e) => setFormData({...formData, is_bus_service_opted: e.target.checked})}
                    />
                    Bus Service Opted
                  </label>
                </div>

                {formData.is_bus_service_opted && (
                  <div className="form-group">
                    <label>Bus Fees Amount (₹):</label>
                    <input
                      type="number"
                      value={formData.bus_fees_amount}
                      onChange={(e) => setFormData({...formData, bus_fees_amount: e.target.value})}
                      min="0"
                      placeholder="Enter bus fees amount"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Course Fees Amount (₹):</label>
                  <input
                    type="number"
                    value={formData.course_fees_amount}
                    onChange={(e) => setFormData({...formData, course_fees_amount: e.target.value})}
                    min="0"
                    placeholder="Enter course fees amount"
                  />
                </div>

                <div className="form-group">
                  <label>Remarks:</label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                    placeholder="Enter any additional remarks or notes"
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingStudent ? 'Update' : 'Create'} Student
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
            </form>
            </div>
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="filter-section">
        <h3>Filter Students</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="class-filter">Class:</label>
            <select
              id="class-filter"
              value={filters.class}
              onChange={(e) => handleFilterChange('class', e.target.value)}
            >
              <option value="">All Classes</option>
              {CLASSES.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="town-filter">Town:</label>
            <select
              id="town-filter"
              value={filters.town_id}
              onChange={(e) => handleFilterChange('town_id', e.target.value)}
            >
              <option value="">All Towns</option>
              {towns.map((town) => (
                <option key={town.id} value={town.id}>
                  {town.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <button 
              onClick={() => setFilters({ class: '', town_id: '' })}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="students-section">
        <h4>Students List ({filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'})</h4>
        <div className="students-table-container">
        <table className="students-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Class</th>
              <th>Gender</th>
              <th>Town</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>
                  <button
                    onClick={() => handleViewDetails(student)}
                    className="student-name-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4c51bf',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: 'inherit',
                      padding: 0,
                      textAlign: 'left'
                    }}
                  >
                    {student.name}
                  </button>
                </td>
                <td>{student.class}</td>
                <td>{student.gender}</td>
                <td>{student.town_name || 'N/A'}</td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(student)}
                      className="btn btn-sm btn-primary"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(student.id)}
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
        
        {filteredStudents.length === 0 && (
          <div className="no-data">
            <p>No students found.</p>
          </div>
        )}
        </div>
      </div>

      {/* Student Details Modal */}
      {viewingStudent && (
        <div className="modal-overlay" onClick={(e) => handleOverlayClick(e, () => setViewingStudent(null))}>
          <div className="modal">
            <div className="modal-header">
              <h3>Student Details - {viewingStudent.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setViewingStudent(null)}
                title="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="student-details">
              <div className="detail-row">
                <div className="detail-group">
                  <label>Name:</label>
                  <span>{viewingStudent.name}</span>
                </div>
                
                <div className="detail-group">
                  <label>Class:</label>
                  <span>{viewingStudent.class}</span>
                </div>
                
                <div className="detail-group">
                  <label>Gender:</label>
                  <span>{viewingStudent.gender}</span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-group">
                  <label>Date of Birth:</label>
                  <span>{viewingStudent.dob}</span>
                </div>
                
                <div className="detail-group">
                  <label>Town:</label>
                  <span>{viewingStudent.town_name || 'N/A'}</span>
                </div>
                
                <div className="detail-group">
                  <label>House:</label>
                  <span className={`house-tag house-${viewingStudent.house.toLowerCase()}`}>
                    {viewingStudent.house}
                  </span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-group">
                  <label>Parents Name:</label>
                  <span>{viewingStudent.parents_name}</span>
                </div>
                
                <div className="detail-group">
                  <label>Contact Info:</label>
                  <span>{viewingStudent.contact_info}</span>
                </div>
                
                <div className="detail-group">
                  <label>Bus Service:</label>
                  <span className={`status-tag ${viewingStudent.is_bus_service_opted ? 'status-paid' : 'status-unpaid'}`}>
                    {viewingStudent.is_bus_service_opted ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-group">
                  <label>Total Fees:</label>
                  <span style={{ fontWeight: 'bold', color: '#2d3748' }}>₹{viewingStudent.fees_total || 0}</span>
                </div>
                
                <div className="detail-group">
                  <label>Fees Paid:</label>
                  <span style={{ fontWeight: 'bold', color: '#38a169' }}>₹{viewingStudent.total_fees_paid || 0}</span>
                </div>
                
                <div className="detail-group">
                  <label>Balance:</label>
                  <span style={{ fontWeight: 'bold', color: getAvailableBalance(viewingStudent) > 0 ? '#e53e3e' : '#38a169' }}>
                    ₹{getAvailableBalance(viewingStudent)}
                  </span>
                </div>
              </div>
              
              <div className="detail-row">
                <div className="detail-group">
                  <label>Bus Fees Amount:</label>
                  <span>₹{viewingStudent.bus_fees_amount || 0}</span>
                </div>
                
                <div className="detail-group">
                  <label>Course Fees Amount:</label>
                  <span>₹{viewingStudent.course_fees_amount || 0}</span>
                </div>
                
                <div className="detail-group">
                  <label>Payment Status:</label>
                  <span className={`status-tag ${getStatusColor(viewingStudent)}`}>
                    {getStatusText(viewingStudent)}
                  </span>
                </div>
              </div>
              
              {viewingStudent.remarks && (
                <div className="detail-row">
                  <div className="detail-group full-width">
                    <label>Remarks:</label>
                    <span style={{ whiteSpace: 'pre-wrap', padding: '0.5rem', backgroundColor: '#f7fafc', borderRadius: '4px', display: 'block' }}>
                      {viewingStudent.remarks}
                    </span>
                  </div>
                </div>
              )}
            </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setViewingStudent(null);
                  handleEdit(viewingStudent);
                }}
              >
                Edit Student
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => setViewingStudent(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

StudentManagement.displayName = 'StudentManagement';

export default StudentManagement;
