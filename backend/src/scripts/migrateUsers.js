/**
 * Migration script to add isEnabled field to existing users
 * Run this once after upgrading to v2.2.4 to ensure backward compatibility
 * 
 * Usage: node src/scripts/migrateUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const migrateUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all users without isEnabled field
    const usersWithoutField = await User.find({
      $or: [
        { isEnabled: { $exists: false } },
        { isEnabled: null }
      ]
    });

    console.log(`Found ${usersWithoutField.length} users without isEnabled field`);

    if (usersWithoutField.length === 0) {
      console.log('No users need migration');
      await mongoose.disconnect();
      return;
    }

    // Update all users to have isEnabled: true (enable existing users)
    const result = await User.updateMany(
      {
        $or: [
          { isEnabled: { $exists: false } },
          { isEnabled: null }
        ]
      },
      {
        $set: { isEnabled: true }
      }
    );

    console.log(`✅ Migrated ${result.modifiedCount} users`);
    console.log('All existing users are now enabled');

    await mongoose.disconnect();
    console.log('Migration complete');
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
};

// Run migration
migrateUsers();

