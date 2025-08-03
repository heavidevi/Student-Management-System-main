const fs = require('fs');
const { connectDB, getDB } = require('./config/database');

async function migrateUsersToMongoDB() {
  try {
    console.log("🔄 Starting user migration to MongoDB...");
    
    // Connect to database
    await connectDB();
    const db = getDB();
    
    // Read users.json file
    const usersData = fs.readFileSync('./users.json', 'utf8');
    const users = JSON.parse(usersData);
    
    console.log(`📊 Found ${users.length} users to migrate`);
    
    // Clear existing users collection (optional - remove if you want to keep existing data)
    await db.collection('users').deleteMany({});
    console.log("🗑️ Cleared existing users collection");
    
    // Insert all users
    const result = await db.collection('users').insertMany(users);
    
    console.log(`✅ Successfully migrated ${result.insertedCount} users to MongoDB!`);
    console.log("📋 Migration summary:");
    
    // Show summary by role
    const adminCount = users.filter(u => u.role === 'admin').length;
    const studentCount = users.filter(u => u.role === 'user').length;
    
    console.log(`   - Admins: ${adminCount}`);
    console.log(`   - Students: ${studentCount}`);
    console.log(`   - Total: ${users.length}`);
    
    // Show students by course
    const studentsByCourse = users
      .filter(u => u.role === 'user')
      .reduce((acc, student) => {
        if (!acc[student.course]) acc[student.course] = 0;
        acc[student.course]++;
        return acc;
      }, {});
    
    console.log("📚 Students by course:");
    Object.entries(studentsByCourse).forEach(([course, count]) => {
      console.log(`   - ${course}: ${count} students`);
    });
    
    console.log("\n🎉 Migration completed successfully!");
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
migrateUsersToMongoDB();