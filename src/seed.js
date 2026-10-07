require('dotenv').config();

const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Note = require('./models/Note');
const Post = require('./models/Post');

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Note.deleteMany({}),
    Post.deleteMany({})
  ]);

  const passwordHash = await bcrypt.hash('password123', 12);

  const [admin, user] = await User.create([
    {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      interests: ['security', 'reading']
    },
    {
      name: 'Normal User',
      email: 'user@example.com',
      passwordHash,
      role: 'user',
      interests: ['chess', 'reading']
    }
  ]);

  await Note.create([
    {
      title: 'Admin private note',
      body: 'Only the admin can see this through the user notes endpoint.',
      owner: admin._id
    },
    {
      title: 'User private note',
      body: 'Only this normal user can manage this note.',
      owner: user._id
    }
  ]);

  await Post.create([
    {
      title: 'Admin public post',
      body: 'This post is visible to everyone.',
      author: admin._id
    },
    {
      title: 'User public post',
      body: 'This post is also visible to everyone.',
      author: user._id
    }
  ]);

  console.log('Seed complete');
  console.log('Admin: admin@example.com / password123');
  console.log('User: user@example.com / password123');
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
