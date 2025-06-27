const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'school.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Towns table
  db.run(`CREATE TABLE IF NOT EXISTS towns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
  )`);

  // Students table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL CHECK(length(name) <= 100),
    gender TEXT NOT NULL CHECK(gender IN ('Male', 'Female')),
    dob TEXT NOT NULL,
    class TEXT NOT NULL CHECK(class IN ('Nursery', 'UKG', 'LKG', 'First', 'Second', 'Third', 'Fourth')),
    parents_name TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    town_id INTEGER,
    house TEXT NOT NULL DEFAULT 'All' CHECK(house IN ('red', 'green', 'blue', 'yellow', 'All')),
    fees_total INTEGER,
    total_fees_paid INTEGER DEFAULT 0,
    is_bus_service_opted BOOLEAN DEFAULT 0,
    bus_fees_amount INTEGER DEFAULT 0,
    course_fees_amount INTEGER DEFAULT 0,
    FOREIGN KEY (town_id) REFERENCES towns (id)
  )`);

  // Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    amount_paid INTEGER NOT NULL,
    fee_type TEXT NOT NULL DEFAULT 'mainFees' CHECK(fee_type IN ('mainFees', 'busFees', 'courseFees')),
    FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
  )`);

  // Insert default towns only if towns table is completely empty (first run)
  db.get('SELECT COUNT(*) as count FROM towns', (err, row) => {
    if (err) {
      console.error('Error checking towns table:', err);
      return;
    }
    
    // Only insert default towns if table is empty (first time setup)
    if (row.count === 0) {
      console.log('First time setup: Adding default towns...');
      db.run(`INSERT INTO towns (name) VALUES 
        ('Delhi'), 
        ('Mumbai'), 
        ('Bangalore'), 
        ('Chennai'), 
        ('Kolkata')
      `, (err) => {
        if (err) {
          console.error('Error inserting default towns:', err);
        } else {
          console.log('Default towns added successfully');
        }
      });
    } else {
      console.log(`Towns table already has ${row.count} towns - skipping default data insertion`);
    }
  });

  // Migration: Update transactions table to support courseFees (if needed)
  db.get("PRAGMA table_info(transactions)", (err, info) => {
    if (err) {
      console.error('Error checking transactions table schema:', err);
      return;
    }
    
    // Check if we need to migrate the fee_type constraint
    db.get("SELECT sql FROM sqlite_master WHERE type='table' AND name='transactions'", (err, row) => {
      if (err) {
        console.error('Error checking table schema:', err);
        return;
      }
      
      if (row && row.sql && !row.sql.includes('courseFees')) {
        console.log('Migrating transactions table to support courseFees...');
        
        // Create new table with updated constraint
        db.run(`CREATE TABLE transactions_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          amount_paid INTEGER NOT NULL,
          fee_type TEXT NOT NULL DEFAULT 'mainFees' CHECK(fee_type IN ('mainFees', 'busFees', 'courseFees')),
          FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE
        )`, (err) => {
          if (err) {
            console.error('Error creating new transactions table:', err);
            return;
          }
          
          // Copy data from old table
          db.run(`INSERT INTO transactions_new SELECT * FROM transactions`, (err) => {
            if (err) {
              console.error('Error migrating transactions data:', err);
              return;
            }
            
            // Drop old table and rename new one
            db.run(`DROP TABLE transactions`, (err) => {
              if (err) {
                console.error('Error dropping old transactions table:', err);
                return;
              }
              
              db.run(`ALTER TABLE transactions_new RENAME TO transactions`, (err) => {
                if (err) {
                  console.error('Error renaming new transactions table:', err);
                } else {
                  console.log('Successfully migrated transactions table to support courseFees');
                }
              });
            });
          });
        });
      } else {
        console.log('Transactions table already supports courseFees - no migration needed');
      }
    });
  });

  // Migration: Add course_fees_amount to students table (if needed)
  db.get("PRAGMA table_info(students)", (err, rows) => {
    if (err) {
      console.error('Error checking students table schema:', err);
      return;
    }
    
    // Check if course_fees_amount column exists
    db.all("PRAGMA table_info(students)", (err, columns) => {
      if (err) {
        console.error('Error getting students table columns:', err);
        return;
      }
      
      const hasCourseFeesColumn = columns.some(col => col.name === 'course_fees_amount');
      
      if (!hasCourseFeesColumn) {
        console.log('Adding course_fees_amount column to students table...');
        db.run("ALTER TABLE students ADD COLUMN course_fees_amount INTEGER DEFAULT 0", (err) => {
          if (err) {
            console.error('Error adding course_fees_amount column:', err);
          } else {
            console.log('Successfully added course_fees_amount column to students table');
          }
        });
      } else {
        console.log('Students table already has course_fees_amount column - no migration needed');
      }
    });
  });
});

// Routes

// Towns CRUD
app.get('/api/towns', (req, res) => {
  db.all('SELECT * FROM towns ORDER BY name', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/towns', (req, res) => {
  const { name } = req.body;
  if (!name) {
    res.status(400).json({ error: 'Town name is required' });
    return;
  }
  
  db.run('INSERT INTO towns (name) VALUES (?)', [name], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, name });
  });
});

app.put('/api/towns/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  db.run('UPDATE towns SET name = ? WHERE id = ?', [name, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: parseInt(id), name });
  });
});

app.delete('/api/towns/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM towns WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Students CRUD
app.get('/api/students', (req, res) => {
  const query = `
    SELECT s.*, t.name as town_name 
    FROM students s 
    LEFT JOIN towns t ON s.town_id = t.id 
    ORDER BY s.name
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/students/class/:className', (req, res) => {
  const { className } = req.params;
  const query = `
    SELECT s.*, t.name as town_name 
    FROM students s 
    LEFT JOIN towns t ON s.town_id = t.id 
    WHERE s.class = ?
    ORDER BY s.name
  `;
  
  db.all(query, [className], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/students', (req, res) => {
  const { name, gender, dob, class: studentClass, parents_name, contact_info, town_id, house, fees_total, is_bus_service_opted, bus_fees_amount, course_fees_amount } = req.body;
  
  const query = `
    INSERT INTO students (name, gender, dob, class, parents_name, contact_info, town_id, house, fees_total, is_bus_service_opted, bus_fees_amount, course_fees_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [name, gender, dob, studentClass, parents_name, contact_info, town_id, house, fees_total, is_bus_service_opted ? 1 : 0, bus_fees_amount || 0, course_fees_amount || 0], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: this.lastID, ...req.body });
  });
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { name, gender, dob, class: studentClass, parents_name, contact_info, town_id, house, fees_total, is_bus_service_opted, bus_fees_amount, course_fees_amount } = req.body;
  
  const query = `
    UPDATE students 
    SET name = ?, gender = ?, dob = ?, class = ?, parents_name = ?, contact_info = ?, town_id = ?, house = ?, fees_total = ?, is_bus_service_opted = ?, bus_fees_amount = ?, course_fees_amount = ?
    WHERE id = ?
  `;
  
  db.run(query, [name, gender, dob, studentClass, parents_name, contact_info, town_id, house, fees_total, is_bus_service_opted ? 1 : 0, bus_fees_amount || 0, course_fees_amount || 0, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ id: parseInt(id), ...req.body });
  });
});

app.delete('/api/students/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM students WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Transactions CRUD
app.get('/api/transactions', (req, res) => {
  const query = `
    SELECT t.*, s.name as student_name, s.class as student_class
    FROM transactions t
    JOIN students s ON t.student_id = s.id
    ORDER BY t.date DESC
  `;
  
  db.all(query, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.get('/api/transactions/student/:studentId', (req, res) => {
  const { studentId } = req.params;
  const query = `
    SELECT * FROM transactions 
    WHERE student_id = ? 
    ORDER BY date DESC
  `;
  
  db.all(query, [studentId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { student_id, name, date, amount_paid, fee_type } = req.body;
  
  db.serialize(() => {
    // Insert transaction
    db.run(
      'INSERT INTO transactions (student_id, name, date, amount_paid, fee_type) VALUES (?, ?, ?, ?, ?)',
      [student_id, name, date, amount_paid, fee_type || 'mainFees'],
      function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Update student's total fees paid
        db.run(
          'UPDATE students SET total_fees_paid = total_fees_paid + ? WHERE id = ?',
          [amount_paid, student_id],
          function(updateErr) {
            if (updateErr) {
              res.status(500).json({ error: updateErr.message });
              return;
            }
            
            res.json({ id: this.lastID, ...req.body });
          }
        );
      }
    );
  });
});

app.put('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  const { student_id, name, date, amount_paid, fee_type } = req.body;
  
  db.serialize(() => {
    // Get old transaction amount
    db.get('SELECT amount_paid, student_id FROM transactions WHERE id = ?', [id], (err, oldTransaction) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!oldTransaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }
      
      // Update transaction
      db.run(
        'UPDATE transactions SET student_id = ?, name = ?, date = ?, amount_paid = ?, fee_type = ? WHERE id = ?',
        [student_id, name, date, amount_paid, fee_type || 'mainFees', id],
        function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
            return;
          }
          
          // Adjust student's total fees paid
          const amountDifference = amount_paid - oldTransaction.amount_paid;
          
          db.run(
            'UPDATE students SET total_fees_paid = total_fees_paid + ? WHERE id = ?',
            [amountDifference, student_id],
            function(updateErr) {
              if (updateErr) {
                res.status(500).json({ error: updateErr.message });
                return;
              }
              
              res.json({ id: parseInt(id), ...req.body });
            }
          );
        }
      );
    });
  });
});

app.delete('/api/transactions/:id', (req, res) => {
  const { id } = req.params;
  
  db.serialize(() => {
    // Get transaction amount before deleting
    db.get('SELECT amount_paid, student_id FROM transactions WHERE id = ?', [id], (err, transaction) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!transaction) {
        res.status(404).json({ error: 'Transaction not found' });
        return;
      }
      
      // Delete transaction
      db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        // Subtract from student's total fees paid
        db.run(
          'UPDATE students SET total_fees_paid = total_fees_paid - ? WHERE id = ?',
          [transaction.amount_paid, transaction.student_id],
          function(updateErr) {
            if (updateErr) {
              res.status(500).json({ error: updateErr.message });
              return;
            }
            
            res.json({ success: true });
          }
        );
      });
    });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
