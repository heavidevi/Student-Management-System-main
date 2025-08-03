const express = require('express');
const { connectDB, getDB } = require('./config/database');

const app = express();
const PORT = 3001; // Different port from your main app

app.use(express.json());
app.use(express.static('public'));

// Set up EJS for views
app.set('view engine', 'ejs');
app.set('views', './views');

// Connect to database when server starts
let database;

async function initializeDB() {
  try {
    database = await connectDB();
    console.log("✅ Database admin service connected to MongoDB");
  } catch (error) {
    console.error("❌ Failed to connect to database:", error);
    process.exit(1);
  }
}

// Home page - Database overview
app.get('/', async (req, res) => {
  try {
    const db = getDB();
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    // Get stats for each collection
    const stats = {};
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      stats[collection.name] = count;
    }
    
    res.json({
      success: true,
      database: 'student_management',
      collections: stats,
      totalCollections: collections.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const db = getDB();
    const users = await db.collection('users').find({}).toArray();
    
    res.json({
      success: true,
      count: users.length,
      users: users
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users by role
app.get('/api/users/role/:role', async (req, res) => {
  try {
    const db = getDB();
    const { role } = req.params;
    const users = await db.collection('users').find({ role }).toArray();
    
    res.json({
      success: true,
      role: role,
      count: users.length,
      users: users
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get students by course
app.get('/api/students/course/:course', async (req, res) => {
  try {
    const db = getDB();
    const { course } = req.params;
    const students = await db.collection('users').find({ 
      role: 'user', 
      course: course 
    }).toArray();
    
    res.json({
      success: true,
      course: course,
      count: students.length,
      students: students
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const user = await db.collection('users').findOne({ id });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: user
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new user
app.post('/api/users', async (req, res) => {
  try {
    const db = getDB();
    const newUser = req.body;
    
    // Add timestamp
    newUser.createdAt = new Date();
    
    const result = await db.collection('users').insertOne(newUser);
    
    res.json({
      success: true,
      message: 'User created successfully',
      insertedId: result.insertedId,
      user: newUser
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    const updates = req.body;
    
    // Add update timestamp
    updates.updatedAt = new Date();
    
    const result = await db.collection('users').updateOne(
      { id }, 
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      modifiedCount: result.modifiedCount
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;
    
    const result = await db.collection('users').deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const db = getDB();
    
    // Get all users
    const allUsers = await db.collection('users').find({}).toArray();
    
    // Calculate statistics
    const stats = {
      totalUsers: allUsers.length,
      admins: allUsers.filter(u => u.role === 'admin').length,
      students: allUsers.filter(u => u.role === 'user').length,
      courseDistribution: {},
      averageAbsences: 0,
      totalTests: 0
    };
    
    // Course distribution
    allUsers.filter(u => u.role === 'user').forEach(student => {
      if (student.course) {
        if (!stats.courseDistribution[student.course]) {
          stats.courseDistribution[student.course] = 0;
        }
        stats.courseDistribution[student.course]++;
      }
    });
    
    // Calculate average absences and total tests
    const students = allUsers.filter(u => u.role === 'user');
    if (students.length > 0) {
      const totalAbsences = students.reduce((sum, s) => sum + (s.absences || 0), 0);
      stats.averageAbsences = Math.round(totalAbsences / students.length * 100) / 100;
      
      stats.totalTests = students.reduce((sum, s) => sum + (s.tests ? s.tests.length : 0), 0);
    }
    
    res.json({
      success: true,
      stats: stats,
      timestamp: new Date()
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all users (dangerous - use with caution)
app.delete('/api/users', async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('users').deleteMany({});
    
    res.json({
      success: true,
      message: 'All users deleted',
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search users
app.get('/api/search', async (req, res) => {
  try {
    const db = getDB();
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }
    
    const users = await db.collection('users').find({
      $or: [
        { fullname: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { course: { $regex: q, $options: 'i' } }
      ]
    }).toArray();
    
    res.json({
      success: true,
      query: q,
      count: users.length,
      users: users
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  await initializeDB();
  
  app.listen(PORT, () => {
    console.log(`🔍 Database Admin Service running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available:`);
    console.log(`   GET  /                     - Database overview`);
    console.log(`   GET  /api/users            - All users`);
    console.log(`   GET  /api/users/role/:role - Users by role`);
    console.log(`   GET  /api/students/course/:course - Students by course`);
    console.log(`   GET  /api/users/:id        - Specific user`);
    console.log(`   POST /api/users            - Add new user`);
    console.log(`   PUT  /api/users/:id        - Update user`);
    console.log(`   DELETE /api/users/:id      - Delete user`);
    console.log(`   GET  /api/stats            - Database statistics`);
    console.log(`   GET  /api/search?q=query   - Search users`);
  });
}

startServer().catch(console.error);