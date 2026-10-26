/**
 * Script to reset a user's password from the command line
 *
 * Usage: node src/scripts/resetPassword.js <username> [--enable] [--admin]
 *
 * In Docker:
 *   docker exec -it netcontrol-backend node src/scripts/resetPassword.js <username>
 *
 * The new password is read with hidden input from the terminal, or from the
 * NEW_PASSWORD environment variable when no terminal is attached. It is never
 * logged or accepted as a command-line argument.
 *
 * Options:
 *   --enable   Also enable the account (isEnabled = true)
 *   --admin    Also give the account the admin role
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const MIN_PASSWORD_LENGTH = 12;

const usage = () => {
  console.log('Usage: node src/scripts/resetPassword.js <username> [--enable] [--admin]');
  console.log('');
  console.log('The new password is prompted for with hidden input, or read from the');
  console.log('NEW_PASSWORD environment variable when no terminal is attached.');
  console.log('');
  console.log('Options:');
  console.log('  --enable   Also enable the account');
  console.log('  --admin    Also give the account the admin role');
};

// Read a line from the terminal without echoing it
const promptHidden = (question) => new Promise((resolve, reject) => {
  const stdin = process.stdin;
  let input = '';

  process.stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding('utf8');

  const cleanup = () => {
    stdin.setRawMode(false);
    stdin.pause();
    stdin.removeListener('data', onData);
    process.stdout.write('\n');
  };

  const onData = (chunk) => {
    for (const char of chunk) {
      if (char === '\r' || char === '\n') {
        cleanup();
        resolve(input);
        return;
      }
      if (char === '\u0003' || char === '\u0004') {
        // Ctrl+C / Ctrl+D
        cleanup();
        reject(new Error('Cancelled'));
        return;
      }
      if (char === '\u007f' || char === '\b') {
        input = input.slice(0, -1);
      } else if (char >= ' ') {
        input += char;
      }
    }
  };

  stdin.on('data', onData);
});

const getNewPassword = async () => {
  if (process.env.NEW_PASSWORD) {
    return process.env.NEW_PASSWORD;
  }

  if (!process.stdin.isTTY) {
    throw new Error('No terminal attached. Run with "docker exec -it" or set NEW_PASSWORD.');
  }

  const password = await promptHidden('New password: ');
  const confirm = await promptHidden('Confirm new password: ');
  if (password !== confirm) {
    throw new Error('Passwords do not match');
  }
  return password;
};

const resetPassword = async (username, { enable, admin }) => {
  const password = await getNewPassword();
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
  }

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/netcontrolapp');

  try {
    const user = await User.findOne({ username });
    if (!user) {
      throw new Error(`User "${username}" not found`);
    }

    // The User model's pre-save hook hashes the password
    user.password = password;
    if (enable) user.isEnabled = true;
    if (admin) user.role = 'admin';
    await user.save();

    console.log(`✅ Password updated for "${user.username}" (${user.callsign})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   isEnabled: ${user.isEnabled}`);
  } finally {
    await mongoose.disconnect();
  }
};

const args = process.argv.slice(2);
const flags = args.filter((arg) => arg.startsWith('--'));
const positional = args.filter((arg) => !arg.startsWith('--'));
const unknown = flags.filter((flag) => !['--enable', '--admin', '--help'].includes(flag));

if (flags.includes('--help')) {
  usage();
  process.exit(0);
}

if (positional.length !== 1 || unknown.length > 0) {
  usage();
  process.exit(1);
}

resetPassword(positional[0], {
  enable: flags.includes('--enable'),
  admin: flags.includes('--admin')
})
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  });
