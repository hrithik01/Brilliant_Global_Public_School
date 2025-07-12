const API_BASE_URL = 'http://localhost:3001/api';

// Helper function for better error handling and performance
const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    console.log(`API Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log(`API Data received:`, data?.length ? `${data.length} items` : 'Success');
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`API Error for ${url}:`, error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - server may be slow or unreachable');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server - make sure backend is running on port 3001');
    }
    throw error;
  }
};

export class ApiService {
  // Students
  static async getStudents() {
    return fetchWithTimeout(`${API_BASE_URL}/students`);
  }

  static async getStudentsByClass(className) {
    return fetchWithTimeout(`${API_BASE_URL}/students/class/${className}`);
  }

  static async createStudent(student) {
    return fetchWithTimeout(`${API_BASE_URL}/students`, {
      method: 'POST',
      body: JSON.stringify(student)
    });
  }

  static async updateStudent(id, student) {
    return fetchWithTimeout(`${API_BASE_URL}/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(student)
    });
  }

  static async deleteStudent(id) {
    return fetchWithTimeout(`${API_BASE_URL}/students/${id}`, {
      method: 'DELETE'
    });
  }

  // Towns
  static async getTowns() {
    return fetchWithTimeout(`${API_BASE_URL}/towns`);
  }

  static async createTown(town) {
    return fetchWithTimeout(`${API_BASE_URL}/towns`, {
      method: 'POST',
      body: JSON.stringify(town)
    });
  }

  static async updateTown(id, town) {
    return fetchWithTimeout(`${API_BASE_URL}/towns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(town)
    });
  }

  static async deleteTown(id) {
    return fetchWithTimeout(`${API_BASE_URL}/towns/${id}`, {
      method: 'DELETE'
    });
  }

  // Transactions
  static async getTransactions() {
    return fetchWithTimeout(`${API_BASE_URL}/transactions`);
  }

  static async getTransactionsByStudent(studentId) {
    return fetchWithTimeout(`${API_BASE_URL}/transactions/student/${studentId}`);
  }

  static async createTransaction(transaction) {
    return fetchWithTimeout(`${API_BASE_URL}/transactions`, {
      method: 'POST',
      body: JSON.stringify(transaction)
    });
  }

  static async updateTransaction(id, transaction) {
    return fetchWithTimeout(`${API_BASE_URL}/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transaction)
    });
  }

  static async deleteTransaction(id) {
    return fetchWithTimeout(`${API_BASE_URL}/transactions/${id}`, {
      method: 'DELETE'
    });
  }
}
