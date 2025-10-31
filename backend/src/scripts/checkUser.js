/**
 * Script to check and enable a specific user account
 * Usage: node src/scripts/checkUser.js <username>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const checkUser = async (username) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/netcontrolapp');
    console.log('Connected to MongoDB');

    // Find user
    const user = await User.findOne({ username: username });
    
    if (!user) {
      console.log(`❌ User "${username}" not found`);
      process.exit(1);
      return;
    }

    console.log(`✅ User "${username}" found`);
    console.log(`   Callsign: ${user.callsign}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   isEnabled: ${user.isEnabled}`);
    console.log(`   Created: ${user.createdAt}`);
    
    // Check if isEnabled field exists
    if (user.isEnabled === undefined) {
      console.log(`\n⚠️  User doesn't have isEnabled field - setting to true`);
      user.isEnabled = true;
      await user.save();
      console.log(`✅ User enabled`);
    } else if (!user.isEnabled) {
      console.log(`\n⚠️  User is disabled - enabling now`);
      user.isEnabled = true;
      await user.save();
      console.log(`✅ User enabled`);
    }

    // Test password if provided
    if (process.argv[3]) {
      const testPassword = process.argv[3];
      const isMatch = await user.comparePassword(testPassword);
      console.log(`\n🔐 Password test: ${isMatch ? '✅ Correct' : '❌ Incorrect'}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Check complete');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

if (process.argv.length < 3) {
  console.log('Usage: node src/scripts/checkUser.js <username> [password]');
  process.exit(1);
}

checkUser(process.argv[2]);

