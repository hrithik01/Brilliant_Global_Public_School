import React, { useState } from 'react';
import './App.css';
import StudentManagement from './components/StudentManagement';
import TransactionManagement from './components/TransactionManagement';

function App() {
  const [currentView, setCurrentView] = useState('students');

  return (
    <div className="App">
      <header className="app-header">
        <h1>Radhe Krishna | Brilliant Global Public School</h1>
        <div className="view-switch">
          <button 
            className={currentView === 'students' ? 'active' : ''}
            onClick={() => setCurrentView('students')}
          >
            Student Management
          </button>
          <button 
            className={currentView === 'transactions' ? 'active' : ''}
            onClick={() => setCurrentView('transactions')}
          >
            Transaction Management
          </button>
        </div>
      </header>
      <main className="app-main">
        {currentView === 'students' ? <StudentManagement /> : <TransactionManagement />}
      </main>
    </div>
  );
}

export default App;
