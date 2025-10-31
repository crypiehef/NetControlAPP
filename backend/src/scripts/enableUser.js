/**
 * Script to enable a specific user account
 * Usage: node src/scripts/enableUser.js <username>
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const enableUser = async (username) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/netcontrolapp');
    console.log('Connected to MongoDB');

    // Find and enable user
    const user = await User.findOne({ username: username });
    
    if (!user) {
      console.log(`❌ User "${username}" not found`);
      process.exit(1);
      return;
    }

    console.log(`Found user: ${user.username} (${user.callsign})`);
    console.log(`Current isEnabled: ${user.isEnabled}`);
    
    user.isEnabled = true;
    await user.save();
    
    console.log(`✅ User "${username}" is now enabled`);
    console.log(`   They should be able to login now`);

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

if (process.argv.length < 3) {
  console.log('Usage: node src/scripts/enableUser.js <username>');
  process.exit(1);
}

enableUser(process.argv[2]);

