const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const { ObjectId } = require("mongodb");
const {
  authenticate,
  authorizeRole,
  generateToken,
} = require("./middleware/auth");
const { connectDB, getDB } = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// MongoDB helper functions
const getUsers = async () => {
  const db = getDB();
  return await db.collection("users").find({}).toArray();
};

const saveUser = async (user) => {
  const db = getDB();
  return await db.collection("users").insertOne(user);
};

const findUserByCredentials = async (username, password) => {
  const db = getDB();
  return await db.collection("users").findOne({
    $and: [
      { $or: [{ username }, { email: username }] },
      { password }
    ]
  });
};

const findUserByEmail = async (email) => {
  const db = getDB();
  return await db.collection("users").findOne({ email });
};

const updateUserPassword = async (email, password) => {
  const db = getDB();
  return await db.collection("users").updateOne(
    { email },
    { $set: { password } }
  );
};

const findUserById = async (id) => {
  const db = getDB();
  return await db.collection("users").findOne({ id });
};

const updateUser = async (id, updates) => {
  const db = getDB();
  return await db.collection("users").updateOne(
    { id },
    { $set: updates }
  );
};

const deleteUser = async (id) => {
  const db = getDB();
  return await db.collection("users").deleteOne({ id });
};

// Courses for selection
const courseList = [
  "Web Development",
  "Graphic Design",
  "App Development",
  "Data Science",
];

// 🔐 In-memory OTP store
const otps = {};

// 📧 Send OTP
async function sendOtpEmail(email, otp) {
  const transporter = nodemailer.createTransporter({
    service: "gmail",
    auth: {
      user: "anasnaseem420@gmail.com",
      pass: "ximt mdea bpin pfio",
    },
  });

  await transporter.sendMail({
    from: '"Student System" <anasnaseem420@gmail.com>',
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP code is: ${otp}`,
  });
}

// 🔒 Middleware: redirect if already logged in
function redirectIfLoggedIn(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      const user = authenticateToken(token);
      const redirectTo =
        user.role === "admin" ? "/admin/dashboard" : "/student/profile";
      return res.redirect(redirectTo);
    } catch (err) {
      // Token invalid, continue to requested page
    }
  }
  next();
}

// Home
app.get("/", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.redirect("/login");

  try {
    const user = authenticateToken(token);
    return res.redirect(
      user.role === "admin" ? "/admin/dashboard" : "/student/profile"
    );
  } catch {
    return res.redirect("/login");
  }
});

// Login
app.get("/login", redirectIfLoggedIn, (req, res) => {
  res.render("login", { error: null, success: null });
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await findUserByCredentials(username, password);

    if (!user)
      return res.render("login", {
        error: "Invalid credentials",
        success: null,
      });

    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true });
    return res.redirect(
      user.role === "admin" ? "/admin/dashboard" : "/student/profile"
    );
  } catch (error) {
    console.error("Login error:", error);
    res.render("login", { error: "Server error", success: null });
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

// 🔁 Forgot Password Flow
app.get("/forgot-password", redirectIfLoggedIn, (req, res) => {
  res.render("auth/forgot-password", { error: null, success: null });
});

app.post("/forgot-password", redirectIfLoggedIn, async (req, res) => {
  try {
    const { email } = req.body;
    const user = await findUserByEmail(email);

    if (!user) {
      return res.render("auth/forgot-password", {
        error: "Email not found",
        success: null,
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps[email] = {
      code: otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    console.log("Generated OTP:", otp);
    await sendOtpEmail(email, otp);

    res.render("auth/verify-otp", { email, error: null });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.render("auth/forgot-password", { error: "Server error", success: null });
  }
});

app.post("/verify-otp", redirectIfLoggedIn, (req, res) => {
  const { email, otp } = req.body;
  const saved = otps[email];

  if (!saved || saved.code !== otp || Date.now() > saved.expires) {
    return res.render("auth/verify-otp", {
      email,
      error: "Invalid or expired OTP.",
    });
  }

  res.render("auth/reset-password", { email, error: null });
});

app.post("/reset-password", redirectIfLoggedIn, async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render("auth/reset-password", {
        email,
        error: "Passwords do not match",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.render("auth/forgot-password", {
        error: "User not found.",
        success: null,
      });
    }

    await updateUserPassword(email, password);
    delete otps[email];

    res.render("login", {
      error: null,
      success: "Password reset successfully. Please log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.render("auth/reset-password", { email: req.body.email, error: "Server error" });
  }
});

// 🛠 Admin Routes
app.get(
  "/admin/dashboard",
  authenticate,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const users = await getUsers();
      const students = users.filter((u) => u.role === "user");
      res.render("admin/dashboard", {
        admin: req.user,
        students,
        courses: courseList,
        totalStudents: students.length,
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).send("Server error");
    }
  }
);

app.get(
  "/admin/add-student",
  authenticate,
  authorizeRole("admin"),
  (req, res) => {
    res.render("admin/add-student", {
      error: null,
      courses: courseList,
    });
  }
);

app.post(
  "/admin/add-student",
  authenticate,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { fullname, username, email, password, course } = req.body;

      // Check for existing user
      const db = getDB();
      const existingUser = await db.collection("users").findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        const error =
          existingUser.username === username
            ? "Username already taken"
            : "Email already taken";

        return res.render("admin/add-student", {
          error,
          courses: courseList,
        });
      }

      const newUser = {
        id: uuidv4(),
        fullname,
        username,
        email,
        password,
        course,
        role: "user",
        absences: 0,
        tests: [],
      };

      await saveUser(newUser);
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Add student error:", error);
      res.render("admin/add-student", { error: "Server error", courses: courseList });
    }
  }
);

// Add missing admin routes
app.get(
  "/admin/students/:id",
  authenticate,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const student = await findUserById(req.params.id);
      if (!student || student.role !== "user") {
        return res.status(404).render("404");
      }
      res.render("admin/edit-student", { student, courses: courseList });
    } catch (error) {
      console.error("Edit student error:", error);
      res.status(500).send("Server error");
    }
  }
);

app.post(
  "/admin/students/:id",
  authenticate,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const { fullname, username, email, password, course, absences } = req.body;
      const updates = { fullname, username, email, course, absences: parseInt(absences) || 0 };
      
      if (password) {
        updates.password = password;
      }

      await updateUser(req.params.id, updates);
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Update student error:", error);
      res.status(500).send("Server error");
    }
  }
);

app.post(
  "/admin/students/:id/delete",
  authenticate,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      await deleteUser(req.params.id);
      res.redirect("/admin/dashboard");
    } catch (error) {
      console.error("Delete student error:", error);
      res.status(500).send("Server error");
    }
  }
);

app.get(
  "/admin/courses/:courseName",
  authenticate,
  authorizeRole("admin"),
  async (req, res) => {
    try {
      const courseName = req.params.courseName;
      const users = await getUsers();
      const students = users.filter(u => u.role === "user" && u.course === courseName);
      res.render("admin/course-details", { courseName, students });
    } catch (error) {
      console.error("Course details error:", error);
      res.status(500).send("Server error");
    }
  }
);

// 👤 Student Profile
app.get("/student/profile", authenticate, authorizeRole("user"), (req, res) => {
  res.render("student/profile", { student: req.user });
});

// 404 Page
app.use((req, res) => {
  res.status(404).render("404");
});

// JWT Verify Function
function authenticateToken(token) {
  const jwt = require("jsonwebtoken");
  return jwt.verify(token, "your_jwt_secret_key");
}

// Initialize database and start server
async function startServer() {
  await connectDB();
  
  // Create initial admin user if it doesn't exist
  const db = getDB();
  const adminExists = await db.collection("users").findOne({ role: "admin" });
  
  if (!adminExists) {
    const adminUser = {
      id: "a001",
      fullname: "Admin",
      username: "admin",
      email: "admin@system.com",
      password: "admin123",
      role: "admin"
    };
    await db.collection("users").insertOne(adminUser);
    console.log("✅ Admin user created");
  }

  // Listen on all interfaces for Render
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(console.error);
