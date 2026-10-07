# Secure Note-Taking Application

Simple full-stack note-taking app built for the technical interview task.

## Stack

- Node.js and Express for the REST API
- MongoDB with Mongoose for database models
- JWT for authentication
- bcrypt for password hashing
- Plain HTML, CSS, and JavaScript frontend

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment file:

```bash
copy .env.example .env
```

3. Edit `.env` if needed:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/secure_notes
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=1d
```

4. Seed test data:

```bash
npm run seed
```

5. Start the app:

```bash
npm run dev
```

Open:

```txt
http://localhost:5000
```

## Separate Deployment

If the frontend is hosted on Vercel and the backend is hosted separately, configure both sides.

### Backend host

Set these environment variables on the backend host:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_private_secret
JWT_EXPIRES_IN=1d
CLIENT_ORIGIN=https://your-vercel-app.vercel.app
```

`CLIENT_ORIGIN` allows the Vercel frontend to call the backend API through CORS.

### Vercel frontend

The frontend reads the backend URL from `public/config.js`.

Create this file for deployment:

```js
window.API_BASE_URL = 'https://your-backend-host.com';
```

There is an example file:

```txt
public/config.example.js
```

For local same-server development, `config.js` is optional because the frontend can call `/api/...` directly.

## Seed Accounts

```txt
Admin: admin@example.com / password123
User:  user@example.com / password123
```

## API Overview

### Auth

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Notes

Authenticated users can manage only their own notes:

```txt
GET    /api/notes?page=1&limit=10
POST   /api/notes
GET    /api/notes/:id
PATCH  /api/notes/:id
DELETE /api/notes/:id
```

### Admin

Admins can manage users and view everyone's notes:

```txt
GET    /api/admin/users?page=1&limit=10
POST   /api/admin/users
PATCH  /api/admin/users/:id
DELETE /api/admin/users/:id
GET    /api/admin/notes?page=1&limit=10
GET    /api/admin/users/grouped-by-interests
```

### Posts

Posts are public, but creating a post requires login:

```txt
GET  /api/posts?page=1&limit=10
POST /api/posts
GET  /api/posts/by-user/:userId
```

## Indexing Strategy

The task requires indexes to be visible through `schema.index(...)`.

### User indexes

```js
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ interests: 1 });
```

Why:

- `email` supports login and prevents duplicate accounts.
- `createdAt` supports admin user listing sorted newest first.
- `interests` supports the group-by-interests aggregation.

### Note indexes

```js
noteSchema.index({ owner: 1, createdAt: -1 });
noteSchema.index({ createdAt: -1 });
```

Why:

- `{ owner, createdAt }` supports a user listing their own notes sorted newest first.
- `{ createdAt }` supports admin listing everyone's notes sorted newest first.
- Single note fetch uses MongoDB's default `_id` index.

### Post indexes

```js
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
```

Why:

- `{ author, createdAt }` supports finding posts by a specific user and the `$lookup` join.
- `{ createdAt }` supports public post listing sorted newest first.

## Required Aggregations

### Scenario 1: Group Users By Interests

Endpoint:

```txt
GET /api/admin/users/grouped-by-interests
```

Uses one aggregation call:

```js
User.collection.aggregate([
  { $unwind: '$interests' },
  {
    $group: {
      _id: '$interests',
      count: { $sum: 1 },
      users: {
        $push: {
          id: '$_id',
          name: '$name',
          email: '$email',
          role: '$role'
        }
      }
    }
  },
  { $sort: { _id: 1 } }
]).toArray();
```

### Scenario 2: User Posts With `$lookup`

Endpoint:

```txt
GET /api/posts/by-user/:userId
```

Uses a single aggregation pipeline with `$lookup`:

```js
User.aggregate([
  { $match: { _id: new mongoose.Types.ObjectId(userId) } },
  {
    $lookup: {
      from: 'posts',
      localField: '_id',
      foreignField: 'author',
      as: 'posts'
    }
  },
  { $project: { passwordHash: 0 } }
]);
```

## How To Explain This In The Interview

Say:

> I built a Node.js and Express REST API with MongoDB and Mongoose. Authentication uses JWT, passwords are hashed with bcrypt, and role-based middleware separates normal user access from admin access.

For authorization:

> Normal users can only query notes where `owner` equals their own user id. Admin routes are protected by both authentication middleware and `requireAdmin` middleware.

For indexes:

> I created only the indexes needed by the required list, read, and aggregation operations. I did not add broad unnecessary indexes because the task specifically asked for an efficient indexing strategy.

For pagination:

> Every list endpoint accepts `page` and `limit`, then uses `skip` and `limit`. The response includes pagination metadata.

For aggregation:

> The interests endpoint uses `$unwind` and `$group` in one aggregate call. The user-posts endpoint uses `$lookup` from users to posts, and the joined field is supported by an index on `posts.author`.

## Laravel Developer Translation

- Express routes are similar to Laravel routes.
- Controllers are similar to Laravel controllers.
- Mongoose models are similar to Eloquent models.
- JWT middleware is similar to auth guards.
- `requireAdmin` is similar to a policy/gate check.
- `schema.index(...)` is similar to defining database indexes in migrations.
