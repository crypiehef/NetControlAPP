/**
 * Script to create K4HEF user directly in MongoDB
 * Run outside Docker: node -r dotenv/config src/scripts/createK4HEF.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Settings = require('../models/Settings');

const createK4HEF = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/netcontrolapp';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    let user = await User.findOne({ username: 'K4HEF' });
    
    if (user) {
      console.log('User K4HEF already exists');
      // Update password and enable
      user.password = 'Shampoo14281';
      user.isEnabled = true;
      user.role = 'admin';
      await user.save();
      console.log('✅ Updated K4HEF user');
    } else {
      // Create new user
      user = await User.create({
        username: 'K4HEF',
        callsign: 'K4HEF',
        email: 'k4hef@example.com',
        password: 'Shampoo14281',
        role: 'admin',
        isEnabled: true
      });
      console.log('✅ Created K4HEF user');

      // Create default settings
      await Settings.create({
        userId: user._id
      });
      console.log('✅ Created default settings');
    }

    // Verify
    const verified = await User.findOne({ username: 'K4HEF' });
    console.log('\nUser Details:');
    console.log('  Username:', verified.username);
    console.log('  Callsign:', verified.callsign);
    console.log('  Email:', verified.email);
    console.log('  Role:', verified.role);
    console.log('  isEnabled:', verified.isEnabled);

    await mongoose.disconnect();
    console.log('\n✅ Done');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createK4HEF();

