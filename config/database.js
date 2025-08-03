const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

// Load .env from the parent directory (root of project)
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Use environment variables for security
const username = process.env.MONGODB_USERNAME || "your_username";
const password = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER || "cluster0.upk7gr9.mongodb.net";
const databaseName = process.env.MONGODB_DATABASE || "student_management";

// Validate required environment variables
if (!password) {
  console.error("❌ MONGODB_PASSWORD environment variable is required!");
  console.error("Please create a .env file with your MongoDB credentials.");
  console.error("Expected .env location:", path.join(__dirname, '..', '.env'));
  process.exit(1);
}

// Build URI with proper encoding
const encodedPassword = encodeURIComponent(password);
const uri = `mongodb+srv://${username}:${encodedPassword}@${cluster}/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

async function connectDB() {
  try {
    console.log("🔄 Connecting to MongoDB Atlas...");
    console.log(`🔗 Cluster: ${cluster}`);
    console.log(`👤 Username: ${username}`);
    console.log(`📊 Database: ${databaseName}`);
    
    await client.connect();
    
    // Test the connection with a ping
    await client.db("admin").command({ ping: 1 });
    
    db = client.db(databaseName);
    console.log("✅ Connected to MongoDB Atlas!");
    
    // Create indexes for better performance
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    console.error("🔍 Troubleshooting:");
    console.error("   1. Check if your .env file exists and has correct credentials");
    console.error("   2. Verify password in MongoDB Atlas Database Access");
    console.error("   3. Check Network Access IP whitelist");
    console.error("   4. Ensure user has proper database permissions");
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
}

// Create database indexes for better performance
async function createIndexes() {
  try {
    const db = getDB();
    
    // Create indexes for users collection
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    
    // Create TTL index for OTPs (auto-expire after specified time)
    await db.collection('otps').createIndex(
      { expiresAt: 1 }, 
      { expireAfterSeconds: 0 }
    );
    
    console.log("📊 Database indexes created successfully");
  } catch (error) {
    console.log("⚠️  Indexes may already exist:", error.message);
  }
}

// ========== USER OPERATIONS ==========

// Get all users
async function getAllUsers() {
  const db = getDB();
  return await db.collection('users').find({}).toArray();
}

// Find user by credentials (username/email + password)
async function findUserByCredentials(username, password) {
  const db = getDB();
  return await db.collection('users').findOne({
    $and: [
      { $or: [{ username }, { email: username }] },
      { password }
    ]
  });
}

// Find user by email
async function findUserByEmail(email) {
  const db = getDB();
  return await db.collection('users').findOne({ email });
}

// Find user by ID
async function findUserById(id) {
  const db = getDB();
  return await db.collection('users').findOne({ id });
}

// Create new user
async function createUser(userData) {
  const db = getDB();
  
  // Add timestamps
  const userWithTimestamp = {
    ...userData,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  return await db.collection('users').insertOne(userWithTimestamp);
}

// Update user
async function updateUser(id, updates) {
  const db = getDB();
  
  // Add updated timestamp
  const updateWithTimestamp = {
    ...updates,
    updatedAt: new Date()
  };
  
  return await db.collection('users').updateOne(
    { id },
    { $set: updateWithTimestamp }
  );
}

// Update user password
async function updateUserPassword(email, password) {
  const db = getDB();
  return await db.collection('users').updateOne(
    { email },
    { 
      $set: { 
        password, 
        updatedAt: new Date() 
      }
    }
  );
}

// Delete user
async function deleteUser(id) {
  const db = getDB();
  return await db.collection('users').deleteOne({ id });
}

// Get users by role
async function getUsersByRole(role) {
  const db = getDB();
  return await db.collection('users').find({ role }).toArray();
}

// ========== OTP OPERATIONS ==========

// Store OTP
async function storeOTP(email, otp, role, expiresInMinutes = 5) {
  const db = getDB();
  
  // Remove any existing OTPs for this email
  await db.collection('otps').deleteMany({ email });
  
  // Store new OTP
  return await db.collection('otps').insertOne({
    email,
    otp,
    role,
    expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
    createdAt: new Date()
  });
}

// Verify and consume OTP
async function verifyOTP(email, otp) {
  const db = getDB();
  
  // Find valid OTP
  const otpRecord = await db.collection('otps').findOne({
    email,
    otp,
    expiresAt: { $gt: new Date() }
  });
  
  if (otpRecord) {
    // Delete the used OTP
    await db.collection('otps').deleteOne({ _id: otpRecord._id });
    return otpRecord;
  }
  
  return null;
}

// Clean expired OTPs manually (backup to TTL index)
async function cleanExpiredOTPs() {
  const db = getDB();
  const result = await db.collection('otps').deleteMany({
    expiresAt: { $lt: new Date() }
  });
  console.log(`🧹 Cleaned ${result.deletedCount} expired OTPs`);
  return result;
}

// ========== ADMIN OPERATIONS ==========

// Get database statistics
async function getDatabaseStats() {
  const db = getDB();
  
  const stats = {
    totalUsers: await db.collection('users').countDocuments(),
    totalStudents: await db.collection('users').countDocuments({ role: 'student' }),
    totalAdmins: await db.collection('users').countDocuments({ role: 'admin' }),
    activeOTPs: await db.collection('otps').countDocuments(),
    collections: await db.listCollections().toArray()
  };
  
  return stats;
}

// Initialize default admin user
async function initializeDefaultAdmin() {
  const db = getDB();
  
  const adminExists = await db.collection("users").findOne({ role: "admin" });
  
  if (!adminExists) {
    const adminUser = {
      id: "a001",
      fullname: "System Administrator",
      username: "admin",
      email: "admin@system.com",
      password: "admin123", // In production, this should be hashed
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection("users").insertOne(adminUser);
    console.log("✅ Default admin user created");
    return adminUser;
  }
  
  console.log("ℹ️  Admin user already exists");
  return adminExists;
}

// ========== NEW DATA VIEWING FUNCTIONS ==========

// View all collections with data
async function viewAllData() {
  const db = getDB();
  const collections = await db.listCollections().toArray();
  const result = {};
  
  for (const collection of collections) {
    const collectionName = collection.name;
    const data = await db.collection(collectionName).find({}).toArray();
    const count = await db.collection(collectionName).countDocuments();
    
    result[collectionName] = {
      count: count,
      data: data
    };
  }
  
  return result;
}

// Get collection data with pagination
async function getCollectionData(collectionName, options = {}) {
  const db = getDB();
  const { limit = 50, skip = 0, sort = { _id: -1 } } = options;
  
  const data = await db.collection(collectionName)
    .find({})
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
    
  const total = await db.collection(collectionName).countDocuments();
  
  return {
    collection: collectionName,
    total: total,
    returned: data.length,
    data: data
  };
}

// Search in any collection
async function searchCollection(collectionName, query = {}) {
  const db = getDB();
  const data = await db.collection(collectionName).find(query).toArray();
  
  return {
    collection: collectionName,
    query: query,
    count: data.length,
    data: data
  };
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await client.close();
    console.log("🔒 MongoDB connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});

// ========== COMMAND LINE DATA VIEWER ==========
if (require.main === module) {
  async function runDataViewer() {
    try {
      await connectDB();
      
      const args = process.argv.slice(2);
      const command = args[0];
      
      console.log("\n🗄️  MongoDB Data Viewer");
      console.log("🕒 " + new Date().toLocaleString());
      console.log("=" * 60);
      
      switch (command) {
        case 'stats':
          const stats = await getDatabaseStats();
          console.log("\n📊 DATABASE STATISTICS:");
          console.log(JSON.stringify(stats, null, 2));
          break;
          
        case 'users':
          const users = await getAllUsers();
          console.log(`\n👥 ALL USERS (${users.length}):`);
          users.forEach((user, index) => {
            console.log(`\n${index + 1}. ${user.fullname} (${user.role})`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Created: ${user.createdAt || 'N/A'}`);
          });
          break;
          
        case 'students':
          const students = await getUsersByRole('student');
          console.log(`\n🎓 STUDENTS (${students.length}):`);
          students.forEach((student, index) => {
            console.log(`\n${index + 1}. ${student.fullname}`);
            console.log(`   ID: ${student.id}`);
            console.log(`   Email: ${student.email}`);
          });
          break;
          
        case 'admins':
          const admins = await getUsersByRole('admin');
          console.log(`\n👨‍💼 ADMINS (${admins.length}):`);
          admins.forEach((admin, index) => {
            console.log(`\n${index + 1}. ${admin.fullname}`);
            console.log(`   ID: ${admin.id}`);
            console.log(`   Email: ${admin.email}`);
          });
          break;
          
        case 'otps':
          const otpsData = await getCollectionData('otps');
          console.log(`\n🔑 OTPs (${otpsData.total}):`);
          otpsData.data.forEach((otp, index) => {
            const isExpired = new Date(otp.expiresAt) < new Date();
            console.log(`\n${index + 1}. ${otp.email}`);
            console.log(`   OTP: ${otp.otp}`);
            console.log(`   Status: ${isExpired ? '❌ EXPIRED' : '✅ ACTIVE'}`);
            console.log(`   Expires: ${otp.expiresAt}`);
          });
          break;
          
        case 'all':
          const allData = await viewAllData();
          console.log("\n📂 ALL DATABASE DATA:");
          console.log(JSON.stringify(allData, null, 2));
          break;
          
        case 'collections':
          const db = getDB();
          const collections = await db.listCollections().toArray();
          console.log(`\n📂 COLLECTIONS (${collections.length}):`);
          for (const collection of collections) {
            const count = await db.collection(collection.name).countDocuments();
            console.log(`   - ${collection.name}: ${count} documents`);
          }
          break;
          
        default:
          console.log("\n🔍 Available Commands:");
          console.log("   node config/database.js stats      - Database statistics");
          console.log("   node config/database.js users      - All users");
          console.log("   node config/database.js students   - Students only");
          console.log("   node config/database.js admins     - Admins only");
          console.log("   node config/database.js otps       - All OTPs");
          console.log("   node config/database.js collections - List collections");
          console.log("   node config/database.js all        - Complete data dump");
          console.log("\n💡 Examples:");
          console.log("   node config/database.js users");
          console.log("   node config/database.js stats");
          break;
      }
      
    } catch (error) {
      console.error("❌ Data viewer error:", error);
    } finally {
      process.exit(0);
    }
  }
  
  runDataViewer();
}

module.exports = {
  connectDB,
  getDB,
  
  // User operations
  getAllUsers,
  findUserByCredentials,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser,
  getUsersByRole,
  
  // OTP operations
  storeOTP,
  verifyOTP,
  cleanExpiredOTPs,
  
  // Admin operations
  getDatabaseStats,
  initializeDefaultAdmin,
  
  // Data viewing operations
  viewAllData,
  getCollectionData,
  searchCollection
};