# 🎓 Student Management System

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-brightgreen)](https://student-management-system-3d5s.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green)](https://www.mongodb.com/atlas)

**Student Management System** built using **Node.js**, **Express.js**, **EJS**, and **MongoDB Atlas**, developed as part of a test project at **Baitussalam**.

This web application provides comprehensive student management with user authentication, admin dashboard, and full **CRUD functionalities**. Data is stored securely in **MongoDB Atlas** cloud database with JWT-based authentication.

## 🌐 Live Demo

**🚀 Live Application**: [https://student-management-system-3d5s.onrender.com](https://student-management-system-3d5s.onrender.com)

### Demo Credentials:
- **Admin Access**: 
  - Username: `admin`
  - Password: `admin123`
- **Student Access**: 
  - Username: `ali`
  - Password: `ali123`

> **Note**: The first load might take 30-60 seconds as Render spins up the free tier service.

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
- 🌐 **Live Deployment** on Render with automatic deployments

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
- **Render** – Cloud deployment platform

---

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB Atlas Account** (free tier available)
- **Gmail Account** (for email OTP service)
- **Render Account** (for deployment - optional)

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
# MongoDB Atlas Configuration
MONGODB_USERNAME=your_username
MONGODB_PASSWORD=your_password
MONGODB_CLUSTER=your_cluster.mongodb.net
MONGODB_DATABASE=student_management

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key

# Email Configuration (for OTP)
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. **Configure MongoDB Atlas**
- Create a free account at [MongoDB Atlas](https://cloud.mongodb.com/)
- Create a new cluster
- Add a database user with read/write permissions
- **Important for Render**: Set Network Access to `0.0.0.0/0` (Allow access from anywhere)
- Copy your connection details to the `.env` file

### 5. **Setup Email Service**
- Enable 2-factor authentication on your Gmail account
- Generate an App Password for nodemailer
- Add your email credentials to the `.env` file

### 6. **Start the Application**
```bash
npm start
```

### 7. **Access the Application**
Open your browser and navigate to:
👉 **http://localhost:3000**

---

## 🌐 Deployment on Render

This application is automatically deployed to Render from the `main` branch.

### Deploy Your Own Copy:

1. **Fork this repository**
2. **Create Render account** at [render.com](https://render.com)
3. **Connect GitHub** and select your forked repository
4. **Configure service**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: `Node`
5. **Add Environment Variables** in Render dashboard:
   ```
   MONGODB_USERNAME=your_username
   MONGODB_PASSWORD=your_password
   MONGODB_CLUSTER=your_cluster.mongodb.net
   MONGODB_DATABASE=student_management
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   NODE_ENV=production
   ```
6. **Deploy** - Render will automatically build and deploy your app

### One-Click Deploy:
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/Student-Management-System)

---

## 🔑 Default Login Credentials

After setup, use these credentials:

### Admin Access:
- **Username:** `admin`
- **Password:** `admin123`

### Sample Student Account:
- **Username:** `ali`
- **Password:** `ali123`

---

## 🌐 Available Services

### Main Application
- **Production**: [https://student-management-system-3d5s.onrender.com](https://student-management-system-3d5s.onrender.com)
- **Local Development**: http://localhost:3000

### Database Admin Panel (Local Only)
Start the admin service to inspect database:
```bash
node config/database.js
```

**API Endpoints** (when running locally on port 4000):
- `GET /stats` - Database statistics
- `GET /users` - View all users
- `GET /users/students` - View students only
- `GET /users/admins` - View admins only
- `GET /collections` - List all collections
- `GET /otps` - View OTPs

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
npm run dev        # Start with nodemon (development)
npm test           # Run tests (if available)
```

---

## 📁 Project Structure

```
Student-Management-System/
├── config/
│   └── database.js          # MongoDB Atlas connection & DB viewer
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── admin.js             # Admin dashboard routes
│   └── student.js           # Student profile routes
├── views/
│   ├── admin/               # Admin dashboard views
│   ├── student/             # Student profile views
│   └── auth/                # Authentication views
├── public/                  # Static assets (CSS, JS, images)
├── server.js                # Main application server
├── .env.example             # Environment variables template
├── render.yaml              # Render deployment configuration
└── README.md                # This file
```

---

## 🔒 Security & Environment Setup

### Production Environment Variables (Render):
In your Render dashboard, add these environment variables:

```env
# Database Configuration
MONGODB_USERNAME=aliadeel2k18
MONGODB_PASSWORD=WlX8ERwVVPpa6Gk8
MONGODB_CLUSTER=cluster0.upk7gr9.mongodb.net
MONGODB_DATABASE=student_management

# JWT Configuration
JWT_SECRET=0d7c0d689236d28dfa318d27925ee21e618c8c88f33582c7616418a4303841904a3f72fcd5c8257a1fa9c08164dded819a0d0e9312f6616a7c5fe67ea4d6c5b9

# Email Configuration
EMAIL_USER=spam.hevy@gmail.com
EMAIL_PASS=2102587ali

# Server Configuration
NODE_ENV=production
```

### Important Security Notes:
- **Never commit `.env` file** to version control
- Use strong, unique passwords for MongoDB
- Generate a secure JWT secret (minimum 32 characters)
- Use Gmail App Passwords, not regular passwords
- **MongoDB Atlas**: Set Network Access to `0.0.0.0/0` for Render deployment
- Regularly rotate your credentials

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Environment Variables** - Sensitive data protection
- **Password Hashing** - Encrypted password storage
- **Email OTP Verification** - Secure password reset
- **Role-based Authorization** - Admin/Student access control
- **Session Management** - Secure cookie handling
- **Cloud Database** - MongoDB Atlas security

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
  role: "student" | "admin",
  course: "Course Name",
  tests: [
    {
      name: "Test Name",
      marks: 85
    }
  ],
  absences: 0,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z"
}
```

### OTPs Collection:
```javascript
{
  email: "user@example.com",
  otp: "123456",
  role: "student",
  expiresAt: "2025-01-01T00:05:00.000Z",
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

---

## 🧪 Testing the Application

### Test Local Setup:
```bash
# Start the application
npm start

# Test database connection (separate terminal)
node config/database.js stats
```

### Test Live Deployment:
Visit: [https://student-management-system-3d5s.onrender.com](https://student-management-system-3d5s.onrender.com)

---

## 🚀 Deployment Information

### Live Deployment:
- **Platform**: Render
- **URL**: https://student-management-system-3d5s.onrender.com
- **Auto-Deploy**: Enabled from `main` branch
- **Environment**: Node.js 18.x
- **Database**: MongoDB Atlas

### Deployment Features:
- ✅ **Automatic deployments** from GitHub
- ✅ **Environment variables** securely managed
- ✅ **SSL certificate** included
- ✅ **Custom domain** support available
- ✅ **Deployment logs** and monitoring
- ✅ **Zero-downtime deployments**

### Performance Notes:
- **Free Tier**: Service spins down after 15 minutes of inactivity
- **Cold Start**: First request may take 30-60 seconds
- **Uptime**: 99%+ availability for paid tiers

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

### Development Workflow:
1. **Local Development** → Test changes locally
2. **Push to GitHub** → Automatic deployment to Render
3. **Monitor** → Check deployment logs and live site

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
coverage/
.nyc_output
```

---

## 🔄 Continuous Integration

This project uses GitHub integration with Render for:
- **Automatic deployments** on push to `main`
- **Build status** tracking
- **Deployment notifications**
- **Environment synchronization**

---

## 📊 Project Stats

- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **Deployment**: Render
- **Status**: ✅ Live and Running

---

## 📌 Notes

- Designed for educational purposes at **Baitussalam**
- Uses **MongoDB Atlas** for secure cloud data storage
- **Environment variables** protect sensitive credentials
- **JWT authentication** for enhanced security
- **Email OTP verification** for password recovery
- Includes comprehensive **admin dashboard**
- **Database admin panel** for local data management
- **Live deployment** on Render with automatic updates

---

## 📞 Support & Links

- **Live Demo**: [https://student-management-system-3d5s.onrender.com](https://student-management-system-3d5s.onrender.com)
- **GitHub Repository**: [Your Repository Link]
- **Issues**: Create an issue in the GitHub repository
- **Render Dashboard**: [render.com](https://render.com) (for deployment management)

---

## 🏆 Achievements

- ✅ **Full-Stack Application** with Node.js & MongoDB
- ✅ **Cloud Database Integration** with MongoDB Atlas
- ✅ **JWT Authentication** implementation
- ✅ **Email OTP System** for password recovery
- ✅ **Admin Dashboard** with CRUD operations
- ✅ **Responsive Design** with EJS templates
- ✅ **Live Deployment** on Render
- ✅ **Automatic CI/CD** with GitHub integration
- ✅ **Database Management Panel** for development

---

**Developed with ❤️ for Baitussalam Test Project**

⚠️ **Security Reminder**: Never commit sensitive credentials to version control. Always use environment variables for production deployments.

🌐 **Live at**: [https://student-management-system-3d5s.onrender.com](https://student-management-system-3d5s.onrender.com)
