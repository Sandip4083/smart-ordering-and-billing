const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });
const User = require('../models/User');

async function checkAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  const admins = await User.find({ role: 'employee' });
  console.log('Admins found:', admins.map(a => a.username));
  if (admins.length === 0) {
    console.log('No admins found. Creating a test admin...');
    const testAdmin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'adminpassword',
      role: 'employee'
    });
    await testAdmin.save();
    console.log('Test admin created: username=admin, password=adminpassword');
  }
  process.exit();
}

checkAdmin();
