const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

// Use environment variables for security
const username = process.env.MONGODB_USERNAME || "your_username";
const password = process.env.MONGODB_PASSWORD;
const cluster = process.env.MONGODB_CLUSTER || "cluster0.upk7gr9.mongodb.net";
const databaseName = process.env.MONGODB_DATABASE || "student_management";

// Validate required environment variables
if (!password) {
  console.error("❌ MONGODB_PASSWORD environment variable is required!");
  console.error("Please create a .env file with your MongoDB credentials.");
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

module.exports = { connectDB, getDB };