# Radhe Krishna | Brilliant Global Public School Management System

A comprehensive full-stack school management system built with modern web technologies.

## 🎯 Features

### Student Management
- ✅ Complete CRUD operations for students
- ✅ Student details: Name, Gender, DOB, Class, Parents, Contact, Town, House
- ✅ Bus service enrollment with fees tracking
- ✅ Course fees management for each student
- ✅ Enhanced UI with clickable student names for detailed view
- ✅ Class and town-based filtering
- ✅ Responsive design with 20% larger fonts for better visibility

### Transaction Management
- ✅ Fee payment tracking (Main Fees, Bus Fees & Course Fees)
- ✅ Class-first dropdown selection for better UX
- ✅ Comprehensive filtering (Class, Student, Date Range, Fee Type)
- ✅ Automatic total fees calculation
- ✅ Real-time transaction management

### Town Management
- ✅ CRUD operations for cities/towns
- ✅ Integrated with student records
- ✅ Persistent data handling

## 🛠 Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite** - Database
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **CSS3** - Responsive styling
- **Modern React Hooks** - State management

## 📁 Project Structure

```
Brilliant_school/
├── backend/
│   ├── server.js          # Express server
│   ├── school.db          # SQLite database
│   ├── package.json       # Backend dependencies
│   └── package-lock.json
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   ├── types.ts       # TypeScript interfaces
│   │   └── App.tsx        # Main app component
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
└── .gitignore             # Git ignore rules
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Brilliant_school
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Backend runs on: http://localhost:3001

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend runs on: http://localhost:3000

### Default Setup
- The system initializes with sample towns (Delhi, Mumbai, Bangalore, Chennai, Kolkata) on first run
- Database is persistent - data survives server restarts
- Deleted towns stay deleted (no automatic re-insertion)

## 🎨 UI/UX Features

- **Enhanced Visibility**: 20% larger fonts throughout the application
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern Switch Components**: For bus service enrollment
- **Smart Forms**: Class-first dropdown with filtered student selection
- **Detailed Student View**: Click student names to see complete information
- **Smart Delete Confirmations**: Specific confirmation dialogs showing relevant details
- **Professional Styling**: Clean, modern interface with proper spacing

## 📊 Database Schema

### Students Table
- ID, Name, Gender, DOB, Class, Parents Name, Contact Info
- Town ID (foreign key), House, Fees Total, Total Fees Paid
- Bus Service Opted (boolean), Bus Fees Amount, Course Fees Amount

### Towns Table
- ID, Name

### Transactions Table
- ID, Student ID (foreign key), Name, Date, Amount Paid
- Fee Type (mainFees/busFees/courseFees)

## 🔧 API Endpoints

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Towns
- `GET /api/towns` - Get all towns
- `POST /api/towns` - Create new town
- `PUT /api/towns/:id` - Update town
- `DELETE /api/towns/:id` - Delete town

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

## 🚀 Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
```

### Environment Variables
Create `.env` files for configuration:
- Database path
- Server port
- CORS origins

## 📝 License

This project is developed for Radhe Krishna | Brilliant Global Public School.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Built with ❤️ for Radhe Krishna | Brilliant Global Public School**
