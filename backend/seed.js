import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/db.js';
import User from './models/User.js';

dotenv.config();

const run = async () => {
  await connectDB();

  const email = 'admin@jobcode.in';
  const plainPassword = 'admin123';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Admin already exists:', email);
    process.exit();
  }

  const hashed = await bcrypt.hash(plainPassword, 10);
  await User.create({ name: 'Admin', email, password: hashed, role: 'admin' });

  console.log('Admin account created. Log in with:');
  console.log('Email:', email);
  console.log('Password:', plainPassword);
  console.log('Change this password by editing seed.js before running it, or add an update route later.');
  process.exit();
};

run();
