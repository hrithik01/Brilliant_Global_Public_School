const API_BASE_URL = 'http://localhost:3001/api';

export class ApiService {
  // Students
  static async getStudents() {
    const response = await fetch(`${API_BASE_URL}/students`);
    return response.json();
  }

  static async getStudentsByClass(className) {
    const response = await fetch(`${API_BASE_URL}/students/class/${className}`);
    return response.json();
  }

  static async createStudent(student) {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return response.json();
  }

  static async updateStudent(id, student) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return response.json();
  }

  static async deleteStudent(id) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Towns
  static async getTowns() {
    const response = await fetch(`${API_BASE_URL}/towns`);
    return response.json();
  }

  static async createTown(town) {
    const response = await fetch(`${API_BASE_URL}/towns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(town)
    });
    return response.json();
  }

  static async updateTown(id, town) {
    const response = await fetch(`${API_BASE_URL}/towns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(town)
    });
    return response.json();
  }

  static async deleteTown(id) {
    const response = await fetch(`${API_BASE_URL}/towns/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }

  // Transactions
  static async getTransactions() {
    const response = await fetch(`${API_BASE_URL}/transactions`);
    return response.json();
  }

  static async getTransactionsByStudent(studentId) {
    const response = await fetch(`${API_BASE_URL}/transactions/student/${studentId}`);
    return response.json();
  }

  static async createTransaction(transaction) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return response.json();
  }

  static async updateTransaction(id, transaction) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return response.json();
  }

  static async deleteTransaction(id) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}
