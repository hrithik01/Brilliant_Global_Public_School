const API_BASE_URL = 'http://localhost:3001/api';

export class ApiService {
  // Students
  static async getStudents() {
    const response = await fetch(`${API_BASE_URL}/students`);
    return response.json();
  }

  static async getStudentsByClass(className: string) {
    const response = await fetch(`${API_BASE_URL}/students/class/${className}`);
    return response.json();
  }

  static async createStudent(student: any) {
    const response = await fetch(`${API_BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return response.json();
  }

  static async updateStudent(id: number, student: any) {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    return response.json();
  }

  static async deleteStudent(id: number) {
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

  static async createTown(town: { name: string }) {
    const response = await fetch(`${API_BASE_URL}/towns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(town)
    });
    return response.json();
  }

  static async updateTown(id: number, town: { name: string }) {
    const response = await fetch(`${API_BASE_URL}/towns/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(town)
    });
    return response.json();
  }

  static async deleteTown(id: number) {
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

  static async createTransaction(transaction: any) {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return response.json();
  }

  static async updateTransaction(id: number, transaction: any) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction)
    });
    return response.json();
  }

  static async deleteTransaction(id: number) {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
    return response.json();
  }
}

// Individual function exports for easier imports
export const getStudents = ApiService.getStudents;
export const getStudentsByClass = ApiService.getStudentsByClass;
export const createStudent = ApiService.createStudent;
export const updateStudent = ApiService.updateStudent;
export const deleteStudent = ApiService.deleteStudent;

export const getTowns = ApiService.getTowns;
export const createTown = ApiService.createTown;
export const updateTown = ApiService.updateTown;
export const deleteTown = ApiService.deleteTown;

export const getTransactions = ApiService.getTransactions;
export const createTransaction = ApiService.createTransaction;
export const updateTransaction = ApiService.updateTransaction;
export const deleteTransaction = ApiService.deleteTransaction;
