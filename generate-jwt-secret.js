const crypto = require('crypto');

console.log('\n🔐 Generating JWT Secret Keys...\n');

// Generate 3 different secure options
for (let i = 1; i <= 3; i++) {
  const secret = crypto.randomBytes(64).toString('hex');
  console.log(`Option ${i}:`);
  console.log(secret);
  console.log('');
}

console.log('✅ Choose any one of these keys for your JWT_SECRET');
console.log('📝 Add it to your .env file as:');
console.log('JWT_SECRET=your_chosen_secret_here');