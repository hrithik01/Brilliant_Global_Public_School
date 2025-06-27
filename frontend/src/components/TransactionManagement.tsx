import React, { useState, useEffect } from 'react';
import { Transaction, Student, CLASSES, FEE_TYPES } from '../types';
import { ApiService } from '../services/api';

type ClassType = typeof CLASSES[number];
type FeeTypeType = typeof FEE_TYPES[number];

const TransactionManagement: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterClass, setFilterClass] = useState<ClassType | ''>('');
  const [filterStudent, setFilterStudent] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState<string>('');
  const [filterDateTo, setFilterDateTo] = useState<string>('');
  const [filterFeeType, setFilterFeeType] = useState<FeeTypeType | ''>('');
  const [filterStudentName, setFilterStudentName] = useState<string>('');

  // Form state
  const [formData, setFormData] = useState({
    class: '' as ClassType | '',
    student_id: '',
    name: '',
    date: '',
    amount_paid: '',
    fee_type: 'mainFees' as FeeTypeType
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const transactionData = {
        ...formData,
        amount_paid: parseFloat(formData.amount_paid)
      };

      if (editingTransaction) {
        await ApiService.updateTransaction(editingTransaction.id, transactionData);
      } else {
        await ApiService.createTransaction(transactionData);
      }

      await fetchTransactions();
      resetForm();
      setIsAddModalOpen(false);
      setEditingTransaction(null);
    } catch (err) {
      setError('Failed to save transaction');
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;
    
    const confirmMessage = `Are you sure you want to delete this transaction?\n\nAmount: ₹${transaction.amount_paid}\nDate: ${transaction.date}\nStudent: ${transaction.name}`;
    
    if (window.confirm(confirmMessage)) {
      try {
        await ApiService.deleteTransaction(id);
        await fetchTransactions();
      } catch (err) {
        setError('Failed to delete transaction');
        console.error(err);
      }
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    const student = getStudentById(transaction.student_id);
    setFormData({
      class: student?.class || '',
      student_id: transaction.student_id.toString(),
      name: transaction.name,
      date: transaction.date,
      amount_paid: transaction.amount_paid.toString(),
      fee_type: transaction.fee_type
    });
    setIsAddModalOpen(true);
  };

  const getFeeTypeDisplay = (feeType: string) => {
    switch (feeType) {
      case 'mainFees':
        return { label: 'Main Fees', className: 'badge-primary' };
      case 'busFees':
        return { label: 'Bus Fees', className: 'badge-warning' };
      case 'courseFees':
        return { label: 'Course Fees', className: 'badge-info' };
      default:
        return { label: 'Unknown', className: 'badge-secondary' };
    }
  };

  const resetForm = () => {
    setFormData({
      class: '',
      student_id: '',
      name: '',
      date: '',
      amount_paid: '',
      fee_type: 'mainFees'
    });
    setEditingTransaction(null);
  };

  const getStudentById = (id: number) => {
    return students.find(student => student.id === id);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const student = getStudentById(transaction.student_id);
    
    if (filterClass && student?.class !== filterClass) return false;
    if (filterStudent && transaction.student_id.toString() !== filterStudent) return false;
    if (filterDateFrom && transaction.date < filterDateFrom) return false;
    if (filterDateTo && transaction.date > filterDateTo) return false;
    if (filterFeeType && transaction.fee_type !== filterFeeType) return false;
    if (filterStudentName && !transaction.name.toLowerCase().includes(filterStudentName.toLowerCase())) return false;
    
    return true;
  });

  if (loading) return <div className="loading">Loading transactions...</div>;

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Transaction Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Transaction
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Class:</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value as ClassType | '')}
            >
              <option value="">All Classes</option>
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Student:</label>
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
            >
              <option value="">All Students</option>
              {students.map(student => (
                <option key={student.id} value={student.id.toString()}>
                  {student.name} ({student.class})
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Fee Type:</label>
            <select
              value={filterFeeType}
              onChange={(e) => setFilterFeeType(e.target.value as FeeTypeType | '')}
            >
              <option value="">All Fee Types</option>
              <option value="mainFees">Main Fees</option>
              <option value="busFees">Bus Fees</option>
              <option value="courseFees">Course Fees</option>
            </select>
          </div>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Student Name (search):</label>
            <input
              type="text"
              value={filterStudentName}
              onChange={(e) => setFilterStudentName(e.target.value)}
              placeholder="Search by student name..."
            />
          </div>

          <div className="filter-group">
            <label>Date From:</label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Date To:</label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setFilterClass('');
              setFilterStudent('');
              setFilterDateFrom('');
              setFilterDateTo('');
              setFilterFeeType('');
              setFilterStudentName('');
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="table-container transactions-table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Student</th>
              <th>Class</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Fee Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map(transaction => {
              const student = getStudentById(transaction.student_id);
              return (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.name}</td>
                  <td>
                    {student ? (
                      <span className={`badge badge-${student.class.toLowerCase()}`}>
                        {student.class}
                      </span>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{transaction.date}</td>
                  <td>₹{transaction.amount_paid}</td>
                  <td>
                    <span className={`badge ${getFeeTypeDisplay(transaction.fee_type).className}`}>
                      {getFeeTypeDisplay(transaction.fee_type).label}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleEdit(transaction)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(transaction.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <button
                className="modal-close"
                onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Class:</label>
                <select
                  value={formData.class}
                  onChange={(e) => {
                    const selectedClass = e.target.value as ClassType | '';
                    setFormData(prev => ({
                      ...prev,
                      class: selectedClass,
                      student_id: '', // Reset student selection when class changes
                      name: ''
                    }));
                  }}
                  required
                >
                  <option value="">Select Class</option>
                  {CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Student:</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => {
                    const studentId = e.target.value;
                    const student = students.find(s => s.id.toString() === studentId);
                    setFormData(prev => ({
                      ...prev,
                      student_id: studentId,
                      name: student ? student.name : ''
                    }));
                  }}
                  required
                  disabled={!formData.class} // Disable until class is selected
                >
                  <option value="">
                    {!formData.class ? 'Select Class First' : 'Select Student'}
                  </option>
                  {students
                    .filter(student => !formData.class || student.class === formData.class)
                    .map(student => (
                    <option key={student.id} value={student.id.toString()}>
                      {student.name} ({student.class})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Student Name:</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  readOnly
                />
              </div>

              <div className="form-group">
                <label>Date:</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount Paid:</label>
                <input
                  type="number"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount_paid: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>Fee Type:</label>
                <select
                  value={formData.fee_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee_type: e.target.value as FeeTypeType }))}
                  required
                >
                  <option value="mainFees">Main Fees</option>
                  <option value="busFees">Bus Fees</option>
                  <option value="courseFees">Course Fees</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => {
                  setIsAddModalOpen(false);
                  resetForm();
                }}>
                  Cancel
                </button>
                <button type="submit">
                  {editingTransaction ? 'Update' : 'Add'} Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
