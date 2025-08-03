# 🎓 Student Management System

**Student Management System** built using **Node.js**, **Express.js**, **EJS**, and **MongoDB Atlas**, developed as part of a test project at **Baitussalam**.

This web application provides comprehensive student management with user authentication, admin dashboard, and full **CRUD functionalities**. Data is stored securely in **MongoDB Atlas** cloud database with JWT-based authentication.

---

## ✨ Main Features

- 🔐 **JWT-based authentication** with secure login/logout
- 👨‍💼 **Admin Dashboard** for complete student management
- 🧾 **Full CRUD operations** - Add, view, update, and delete student records
- 📊 **Course Management** - Organize students by different courses
- 📧 **Password Reset** with email OTP verification
- 🎯 **Student Profiles** with test scores and attendance tracking
- ☁️ **Cloud Database** using MongoDB Atlas
- 🖥️ **Responsive UI** powered by **EJS templates**
- 🔍 **Database Admin Panel** for data inspection and management

---

## 🛠 Tech Stack

- **Node.js** – JavaScript runtime environment
- **Express.js** – Web application framework
- **EJS** – Server-side templating engine
- **MongoDB Atlas** – Cloud database service
- **JWT (jsonwebtoken)** – Secure authentication tokens
- **Nodemailer** – Email service for OTP verification
- **bcryptjs** – Password hashing and security
- **UUID** – Unique identifier generation

---

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **MongoDB Atlas Account** (free tier available)
- **Gmail Account** (for email OTP service)

---

## 🚀 Installation & Setup

### 1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/Student-Management-System.git
cd Student-Management-System
```

### 2. **Install dependencies**
```bash
npm install
```

### 3. **Environment Variables Setup**
Create a `.env` file in the root directory:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
MONGODB_DATABASE=student_management
JWT_SECRET=your_secure_jwt_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=3000
```

### 4. **Configure MongoDB Atlas**
- Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
- Create a new cluster
- Add a database user with read/write permissions
- Whitelist your IP address (or use 0.0.0.0/0 for development)
- Copy your connection string to the `.env` file

### 5. **Setup Email Service**
- Enable 2-factor authentication on your Gmail account
- Generate an App Password for nodemailer
- Add your email credentials to the `.env` file

### 6. **Migrate Initial Data** (Optional)
If you have existing data in `users.json`:
```bash
npm run migrate
```

### 7. **Start the Application**
```bash
npm start
```

### 8. **Access the Application**
Open your browser and navigate to:
👉 **http://localhost:3000**

---

## 🔑 Default Login Credentials

After migration, use these credentials:

### Admin Access:
- **Username:** `admin`
- **Password:** `admin123`

### Sample Student Account:
- **Username:** `ali`
- **Password:** `ali123`

---

## 🌐 Available Services

### Main Application (Port 3000)
- Student Management System
- Admin Dashboard
- Authentication & Authorization

### Database Admin Panel (Port 3001)
Start the admin service to inspect database:
```bash
npm run db-admin
```

**API Endpoints:**
- `GET /api/users` - View all users
- `GET /api/users/role/admin` - View admins only
- `GET /api/users/role/user` - View students only
- `GET /api/stats` - Database statistics
- `GET /api/search?q=query` - Search users

---

## 📚 Available Courses

- **Web Development**
- **Graphic Design**
- **App Development**
- **Data Science**

---

## 🔧 NPM Scripts

```bash
npm start          # Start main application
npm run db-admin   # Start database admin panel
npm run migrate    # Migrate users.json to MongoDB
```

---

## 📁 Project Structure

```
Student-Management-System/
├── config/
│   └── database.js          # MongoDB Atlas connection
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── views/
│   ├── admin/               # Admin dashboard views
│   ├── student/             # Student profile views
│   └── auth/                # Authentication views
├── public/                  # Static assets (CSS, JS, images)
├── server.js                # Main application server
├── db-admin.js              # Database admin service
├── migrate-users.js         # Data migration script
├── .env.example             # Environment variables template
└── users.json               # Legacy data file
```

---

## 🔒 Security & Environment Setup

### Create `.env` file:
Copy `.env.example` to `.env` and fill in your credentials:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
MONGODB_DATABASE=student_management

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Server Configuration
PORT=3000
```

### Important Security Notes:
- **Never commit `.env` file** to version control
- Use strong, unique passwords for MongoDB
- Generate a secure JWT secret (minimum 32 characters)
- Use Gmail App Passwords, not regular passwords
- Regularly rotate your credentials

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Environment Variables** - Sensitive data protection
- **Password Hashing** - Encrypted password storage
- **Email OTP Verification** - Secure password reset
- **Role-based Authorization** - Admin/Student access control
- **Session Management** - Secure cookie handling

---

## ☁️ Database Schema

### Users Collection:
```javascript
{
  id: "unique-uuid",
  fullname: "Student Name",
  username: "username",
  email: "email@example.com",
  password: "hashed-password",
  role: "user" | "admin",
  course: "Course Name",
  tests: [
    {
      name: "Test Name",
      marks: 85
    }
  ],
  absences: 0
}
```

---

## 🧪 Testing the Application

### Test Database Connection:
```bash
node test-connection.js
```

### Verify Migration:
```bash
node verify-migration.js
```

---

## 🚀 Deployment

This application is ready for deployment on:
- **Heroku**
- **Vercel**
- **Railway**
- **DigitalOcean**

### Deployment Environment Variables:
Make sure to set these environment variables on your hosting platform:
- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `PORT` (usually set automatically by hosting provider)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes (never commit `.env` files)
4. Push to the branch
5. Create a Pull Request

---

## 📝 .gitignore

Make sure your `.gitignore` includes:
```
node_modules/
.env
.env.local
.env.production
*.log
.DS_Store
```

---

## 📌 Notes

- Designed for educational purposes at **Baitussalam**
- Uses **MongoDB Atlas** for secure cloud data storage
- **Environment variables** protect sensitive credentials
- **JWT authentication** for enhanced security
- **Email OTP verification** for password recovery
- Includes comprehensive **admin dashboard**
- **Database admin panel** for data management

---

## 📞 Support

For issues or questions, please create an issue in the GitHub repository.

---

**Developed with ❤️ for Baitussalam Test Project**

⚠️ **Security Reminder**: Never commit sensitive credentials to version control. Always use environment variables for production deployments.
