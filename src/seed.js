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

  const [admin, user, coordinator, support, qa] = await User.create([
    {
      name: 'Rahman Tutul',
      email: 'admin@example.com',
      passwordHash,
      role: 'admin',
      interests: ['security', 'backend', 'operations']
    },
    {
      name: 'Nadia Rahman',
      email: 'user@example.com',
      passwordHash,
      role: 'user',
      interests: ['client care', 'documentation', 'training']
    },
    {
      name: 'Tanvir Ahmed',
      email: 'tanvir@example.com',
      passwordHash,
      role: 'user',
      interests: ['scheduling', 'operations', 'reporting']
    },
    {
      name: 'Ahnaf Islam',
      email: 'ahnaf@example.com',
      passwordHash,
      role: 'user',
      interests: ['support', 'communication', 'client care']
    },
    {
      name: 'Maliha Karim',
      email: 'maliha@example.com',
      passwordHash,
      role: 'user',
      interests: ['quality assurance', 'security', 'documentation']
    }
  ]);

  await Note.create([
    {
      title: 'Review production access checklist',
      body: 'Confirm JWT secret, CORS origin, MongoDB connection, and PM2 restart policy before final submission.',
      owner: admin._id
    },
    {
      title: 'Prepare interview explanation',
      body: 'Practice explaining schema.index choices, role middleware, pagination helper, and both aggregation pipelines.',
      owner: admin._id
    },
    {
      title: 'Client onboarding notes',
      body: 'Document the required client information, emergency contact fields, and follow-up schedule before onboarding call.',
      owner: user._id
    },
    {
      title: 'Training material draft',
      body: 'Add examples for secure password storage, JWT expiry, and how private notes differ from public posts.',
      owner: user._id
    },
    {
      title: 'Weekly scheduling reminders',
      body: 'Check all pending shift swaps by Thursday evening and notify operations if a schedule conflict remains unresolved.',
      owner: coordinator._id
    },
    {
      title: 'Support escalation checklist',
      body: 'Verify user identity, record the issue summary, assign priority, and update the requester before closing the ticket.',
      owner: support._id
    },
    {
      title: 'QA review points',
      body: 'Test normal user restrictions, admin-only routes, deleted user behavior, and invalid token responses.',
      owner: qa._id
    }
  ]);

  await Post.create([
    {
      title: 'API deployment completed',
      body: 'The backend API is live on the EC2 server, PM2 is managing the process, and the health endpoint is responding correctly.',
      author: admin._id
    },
    {
      title: 'Frontend connected to backend',
      body: 'The Vercel frontend now proxies API requests to the backend. Login, notes, public posts, and admin reports have been tested.',
      author: user._id
    },
    {
      title: 'Operations update',
      body: 'Pagination is enabled on list views so larger datasets can be reviewed without loading everything at once.',
      author: coordinator._id
    },
    {
      title: 'Security reminder',
      body: 'Never commit .env files. JWT secrets and database URLs should stay in server environment variables only.',
      author: qa._id
    },
    {
      title: 'Support note',
      body: 'If a user reports missing notes, first confirm they are logged in with the correct account because notes are private per owner.',
      author: support._id
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
