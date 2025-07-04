import React, { useState, useEffect } from 'react';
import { Student, Town, CLASSES, GENDERS, HOUSES } from '../types';
import { ApiService } from '../services/api';
import TownManagement from './TownManagement';

const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [towns, setTowns] = useState<Town[]>([]);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showTownManagement, setShowTownManagement] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    class: '',
    town_id: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    gender: 'Male' as 'Male' | 'Female',
    dob: '',
    class: 'Nursery' as typeof CLASSES[number],
    parents_name: '',
    contact_info: '',
    town_id: '',
    house: 'All' as typeof HOUSES[number],
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handleEdit = (student: Student) => {
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

  const handleDelete = async (id: number) => {
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
      gender: 'Male' as 'Male' | 'Female',
      dob: '',
      class: 'Nursery' as typeof CLASSES[number],
      parents_name: '',
      contact_info: '',
      town_id: '',
      house: 'All' as typeof HOUSES[number],
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

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      class: '',
      town_id: ''
    });
  };

  if (showTownManagement) {
    return (
      <TownManagement 
        onClose={() => setShowTownManagement(false)}
        onTownsUpdated={loadTowns}
      />
    );
  }

  return (
    <div className="student-management">
      <div className="management-header">
        <h2>Student Management</h2>
        <div className="header-buttons">
          <button onClick={handleNewStudent} className="btn btn-primary">
            Add New Student
          </button>
          <button onClick={() => setShowTownManagement(true)} className="btn btn-secondary">
            Manage Towns
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button
                className="modal-close"
                onClick={() => setShowForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-form">
                <div className="form-grid">
                <div className="form-group">
                  <label>Name (max 100 characters):</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender:</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as any})}
                    required
                  >
                    {GENDERS.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Date of Birth:</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Class:</label>
                  <select
                    value={formData.class}
                    onChange={(e) => setFormData({...formData, class: e.target.value as any})}
                    required
                  >
                    {CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Parents Name:</label>
                  <input
                    type="text"
                    value={formData.parents_name}
                    onChange={(e) => setFormData({...formData, parents_name: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Contact Info:</label>
                  <input
                    type="text"
                    value={formData.contact_info}
                    onChange={(e) => setFormData({...formData, contact_info: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Town:</label>
                  <select
                    value={formData.town_id}
                    onChange={(e) => setFormData({...formData, town_id: e.target.value})}
                    required
                  >
                    <option value="">Select a town</option>
                    {towns.map(town => (
                      <option key={town.id} value={town.id}>{town.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>House:</label>
                  <select
                    value={formData.house}
                    onChange={(e) => setFormData({...formData, house: e.target.value as any})}
                    required
                  >
                    {HOUSES.map(house => (
                      <option key={house} value={house} style={{color: house === 'All' ? 'black' : house}}>
                        {house}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Total Fees (optional):</label>
                  <input
                    type="number"
                    value={formData.fees_total}
                    onChange={(e) => setFormData({...formData, fees_total: e.target.value})}
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Bus Service Opted:</label>
                  <div className="switch-container">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={formData.is_bus_service_opted}
                        onChange={(e) => setFormData({...formData, is_bus_service_opted: e.target.checked})}
                      />
                      <span className="slider"></span>
                    </label>
                    <span className="switch-label">
                      {formData.is_bus_service_opted ? 'Yes' : 'No'}
                    </span>
                  </div>
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
          
          <button onClick={clearFilters} className="btn btn-secondary">
            Clear Filters
          </button>
        </div>
        <div className="filter-info">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading">Loading students...</div>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Gender</th>
                <th>Town</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>
                    <button 
                      className="student-name-link"
                      onClick={() => setViewingStudent(student)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#667eea',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        fontSize: 'inherit',
                        padding: 0,
                        fontWeight: 'normal'
                      }}
                    >
                      {student.name}
                    </button>
                  </td>
                  <td>
                    <span className={`badge badge-${student.class.toLowerCase()}`}>
                      {student.class}
                    </span>
                  </td>
                  <td>{student.gender}</td>
                  <td>{student.town_name}</td>
                  <td>
                    <button 
                      onClick={() => handleEdit(student)}
                      className="btn btn-small btn-primary"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(student.id)}
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
        {filteredStudents.length === 0 && !loading && (
          <div className="no-data">
            {students.length === 0 ? 'No students found' : 'No students match the current filters'}
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {viewingStudent && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Student Details - {viewingStudent.name}</h3>
              <button
                className="modal-close"
                onClick={() => setViewingStudent(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-form">
              <div className="student-details-grid">
                <div className="detail-group">
                  <label>ID:</label>
                  <span>{viewingStudent.id}</span>
                </div>
                
                <div className="detail-group">
                  <label>Name:</label>
                  <span>{viewingStudent.name}</span>
                </div>
                
                <div className="detail-group">
                  <label>Gender:</label>
                  <span>{viewingStudent.gender}</span>
                </div>
                
                <div className="detail-group">
                  <label>Date of Birth:</label>
                  <span>{new Date(viewingStudent.dob).toLocaleDateString()}</span>
                </div>
                
                <div className="detail-group">
                  <label>Class:</label>
                  <span className={`badge badge-${viewingStudent.class.toLowerCase()}`}>
                    {viewingStudent.class}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Parents Name:</label>
                  <span>{viewingStudent.parents_name}</span>
                </div>
                
                <div className="detail-group">
                  <label>Contact Info:</label>
                  <span>{viewingStudent.contact_info}</span>
                </div>
                
                <div className="detail-group">
                  <label>Town:</label>
                  <span>{viewingStudent.town_name}</span>
                </div>
                
                <div className="detail-group">
                  <label>House:</label>
                  <span 
                    className="house-badge" 
                    style={{
                      backgroundColor: viewingStudent.house === 'All' ? '#gray' : viewingStudent.house,
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  >
                    {viewingStudent.house}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Total Fees:</label>
                  <span>₹{viewingStudent.fees_total || 0}</span>
                </div>
                
                <div className="detail-group">
                  <label>Fees Paid:</label>
                  <span>₹{viewingStudent.total_fees_paid}</span>
                </div>
                
                <div className="detail-group">
                  <label>Bus Service:</label>
                  <span 
                    className={`badge ${viewingStudent.is_bus_service_opted ? 'badge-success' : 'badge-secondary'}`}
                  >
                    {viewingStudent.is_bus_service_opted ? 'Yes' : 'No'}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Bus Fees Amount:</label>
                  <span>₹{viewingStudent.bus_fees_amount || 0}</span>
                </div>
                
                <div className="detail-group">
                  <label>Course Fees Amount:</label>
                  <span>₹{viewingStudent.course_fees_amount || 0}</span>
                </div>
                
                {viewingStudent.remarks && (
                  <div className="detail-group">
                    <label>Remarks:</label>
                    <span style={{ whiteSpace: 'pre-wrap' }}>{viewingStudent.remarks}</span>
                  </div>
                )}
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
        </div>
      )}
    </div>
  );
};

export default StudentManagement;
