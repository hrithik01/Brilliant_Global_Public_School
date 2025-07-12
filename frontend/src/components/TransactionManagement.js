import React, { useState, useEffect } from 'react';
import { CLASSES, FEE_TYPES } from '../types';
import { ApiService } from '../services/api';

const TransactionManagement = React.memo(() => {
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filterClass, setFilterClass] = useState('');
  const [filterStudent, setFilterStudent] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterFeeType, setFilterFeeType] = useState('');
  const [filterStudentName, setFilterStudentName] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    class: '',
    student_id: '',
    name: '',
    date: '',
    amount_paid: '',
    fee_type: 'mainFees',
    online: false
  });

  useEffect(() => {
    fetchTransactions();
    fetchStudents();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getTransactions();
      setTransactions(data);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await ApiService.getStudents();
      setStudents(data);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        student_id: parseInt(formData.student_id),
        name: formData.name,
        date: formData.date,
        amount_paid: parseInt(formData.amount_paid),
        fee_type: formData.fee_type,
        online: formData.online
      };

      if (editingTransaction) {
        await ApiService.updateTransaction(editingTransaction.id, transactionData);
      } else {
        await ApiService.createTransaction(transactionData);
      }

      setIsAddModalOpen(false);
      setEditingTransaction(null);
      resetForm();
      fetchTransactions();
    } catch (err) {
      setError('Failed to save transaction');
      console.error(err);
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      class: transaction.student_class || '',
      student_id: transaction.student_id.toString(),
      name: transaction.name,
      date: transaction.date,
      amount_paid: transaction.amount_paid.toString(),
      fee_type: transaction.fee_type,
      online: transaction.online || false
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (id) => {
    const transaction = transactions.find(t => t.id === id);
    const transactionDetails = transaction 
      ? `${transaction.student_name} - ₹${transaction.amount_paid} (${transaction.fee_type})`
      : 'Unknown Transaction';
    
    if (window.confirm(`Are you sure you want to delete this transaction: ${transactionDetails}?`)) {
      try {
        await ApiService.deleteTransaction(id);
        fetchTransactions();
      } catch (err) {
        setError('Failed to delete transaction');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      class: '',
      student_id: '',
      name: '',
      date: '',
      amount_paid: '',
      fee_type: 'mainFees',
      online: false
    });
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleClassChange = (selectedClass) => {
    setFormData(prev => ({
      ...prev,
      class: selectedClass,
      student_id: '',
      name: ''
    }));
  };

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.id === parseInt(studentId));
    setFormData(prev => ({
      ...prev,
      student_id: studentId,
      name: student ? student.name : ''
    }));
  };

  const getFilteredStudents = () => {
    let filteredStudents;
    
    if (formData.class) {
      // If a class is selected, show only students from that class
      filteredStudents = students.filter(student => student.class === formData.class);
    } else {
      // If no class is selected, show all students
      filteredStudents = [...students];
    }
    
    // Always sort students alphabetically by name (A-Z)
    return filteredStudents.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesClass = !filterClass || transaction.student_class === filterClass;
      const matchesStudent = !filterStudent || transaction.student_id === parseInt(filterStudent);
      const matchesDateFrom = !filterDateFrom || transaction.date >= filterDateFrom;
      const matchesDateTo = !filterDateTo || transaction.date <= filterDateTo;
      const matchesFeeType = !filterFeeType || transaction.fee_type === filterFeeType;
      const matchesStudentName = !filterStudentName || 
        transaction.student_name?.toLowerCase().includes(filterStudentName.toLowerCase());

      return matchesClass && matchesStudent && matchesDateFrom && 
             matchesDateTo && matchesFeeType && matchesStudentName;
    });
  };

  const clearFilters = () => {
    setFilterClass('');
    setFilterStudent('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterFeeType('');
    setFilterStudentName('');
  };

  const getFeeTypeLabel = (feeType) => {
    switch (feeType) {
      case 'mainFees':
        return 'Main Fees';
      case 'busFees':
        return 'Bus Fees';
      case 'courseFees':
        return 'Course Fees';
      default:
        return feeType;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading) {
    return <div className="loading">Loading transactions...</div>;
  }

  return (
    <div className="transaction-management">
      <div className="management-header">
        <h2>Transaction Management</h2>
        <button onClick={handleAddNew} className="btn btn-primary">
          Add New Transaction
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      {/* Add/Edit Transaction Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setIsAddModalOpen(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <button 
                className="close-btn"
                onClick={() => setIsAddModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="transaction-form">
              <div className="form-container">
                <div className="form-row">
                  <div className="form-group">
                    <label>Class:</label>
                    <select
                      value={formData.class}
                      onChange={(e) => handleClassChange(e.target.value)}
                    >
                      <option value="">All Classes</option>
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Student*:</label>
                    <select
                      value={formData.student_id}
                      onChange={(e) => handleStudentChange(e.target.value)}
                      required
                    >
                      <option value="">
                        {formData.class ? "Select Student" : "Select Student (All Classes A-Z)"}
                      </option>
                      {getFilteredStudents().map((student) => (
                        <option key={student.id} value={student.id}>
                          {formData.class 
                            ? `${student.name} c/o ${student.parents_name}`
                            : `${student.name} c/o ${student.parents_name} (${student.class})`
                          }
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Fee Type*:</label>
                    <select
                      value={formData.fee_type}
                      onChange={(e) => setFormData({...formData, fee_type: e.target.value})}
                      required
                    >
                      {FEE_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {getFeeTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Online Payment:</label>
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        id="online-toggle"
                        checked={formData.online}
                        onChange={(e) => setFormData({...formData, online: e.target.checked})}
                      />
                      <label htmlFor="online-toggle" className="toggle-label">
                        <span className="toggle-text">
                          {formData.online ? 'Yes' : 'No'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Student Name*:</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="Student name (auto-filled)"
                      readOnly
                    />
                  </div>

                  <div className="form-group">
                    <label>Date*:</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Amount Paid (₹)*:</label>
                    <input
                      type="number"
                      value={formData.amount_paid}
                      onChange={(e) => setFormData({...formData, amount_paid: e.target.value})}
                      required
                      min="0"
                      step="1"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingTransaction ? 'Update' : 'Create'} Transaction
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
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
        <h3>Filter Transactions</h3>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="class-filter">Class:</label>
            <select
              id="class-filter"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
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
            <label htmlFor="student-filter">Student:</label>
            <select
              id="student-filter"
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {students
                .filter(student => !filterClass || student.class === filterClass)
                .map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="fee-type-filter">Fee Type:</label>
            <select
              id="fee-type-filter"
              value={filterFeeType}
              onChange={(e) => setFilterFeeType(e.target.value)}
            >
              <option value="">All Types</option>
              {FEE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {getFeeTypeLabel(type)}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="student-name-filter">Student Name:</label>
            <input
              type="text"
              id="student-name-filter"
              value={filterStudentName}
              onChange={(e) => setFilterStudentName(e.target.value)}
              placeholder="Search by student name"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="date-from-filter">Date From:</label>
            <input
              type="date"
              id="date-from-filter"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="date-to-filter">Date To:</label>
            <input
              type="date"
              id="date-to-filter"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <button 
              onClick={clearFilters}
              className="btn btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="transactions-section">
        <h4>Transactions List ({filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'})</h4>
        <div className="transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Online</th>
              <th>Amount Paid</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td>{transaction.student_name}</td>
                <td>
                  <span className="class-tag">
                    {transaction.student_class}
                  </span>
                </td>
                <td>
                  <span className={`online-status ${transaction.online ? 'online-yes' : 'online-no'}`}>
                    {transaction.online ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="amount-cell">₹{transaction.amount_paid}</td>
                <td>
                  <div className="table-actions">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="btn btn-sm btn-primary"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(transaction.id)}
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
        
        {filteredTransactions.length === 0 && (
          <div className="no-data">
            <p>No transactions found.</p>
          </div>
        )}
        </div>
      </div>

      {/* Summary */}
      <div className="transaction-summary">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <label>Total Transactions:</label>
            <span>{filteredTransactions.length}</span>
          </div>
          <div className="stat-item">
            <label>Total Amount:</label>
            <span>₹{filteredTransactions.reduce((sum, t) => sum + t.amount_paid, 0)}</span>
          </div>
          <div className="stat-item">
            <label>Main Fees:</label>
            <span>₹{filteredTransactions.filter(t => t.fee_type === 'mainFees').reduce((sum, t) => sum + t.amount_paid, 0)}</span>
          </div>
          <div className="stat-item">
            <label>Bus Fees:</label>
            <span>₹{filteredTransactions.filter(t => t.fee_type === 'busFees').reduce((sum, t) => sum + t.amount_paid, 0)}</span>
          </div>
          <div className="stat-item">
            <label>Course Fees:</label>
            <span>₹{filteredTransactions.filter(t => t.fee_type === 'courseFees').reduce((sum, t) => sum + t.amount_paid, 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

TransactionManagement.displayName = 'TransactionManagement';

export default TransactionManagement;
