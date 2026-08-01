# Jobcode Clone (MERN)

A minimal MERN job-listing site: public homepage with tag filter + pagination, single post pages, and an admin area to log in and create/edit/delete posts.

## Structure

```
backend/    Express + MongoDB (Mongoose) REST API
frontend/   React (Vite) client
```

## 1. Set up MongoDB

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Create a database user + password, and allow network access from your IP (or 0.0.0.0/0 for local dev).
3. Copy the connection string (looks like `mongodb+srv://user:pass@cluster0.mongodb.net/jobcode`).

## 2. Backend setup

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env` and paste in your `MONGO_URI`, and set a random `JWT_SECRET` (any long random string).

Create your admin login:

```bash
npm run seed
```

This prints an email/password — that's how you'll log into `/admin/login`. Edit `seed.js` first if you want a different email/password.

Start the API:

```bash
npm run dev
```

Runs on http://localhost:5000

## 3. Frontend setup

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Runs on http://localhost:5173 and talks to the API at the URL in `.env`.

## 4. Try it out

- Visit http://localhost:5173 — empty homepage (no posts yet).
- Go to `/admin/login`, sign in with the seeded admin credentials.
- Click "+ New Post", fill in title/excerpt/content/tags, publish.
- Back on the homepage, your post appears; click a tag to filter, click the post to view its detail page.

## Notes / next steps

- `content` is rendered with `dangerouslySetInnerHTML` — fine since only the trusted admin writes posts. If you ever open posting up to multiple/untrusted users, sanitize HTML server-side first (e.g. with `sanitize-html`) before saving.
- Passwords are hashed with bcrypt; auth uses JWT in `localStorage`. Good enough for learning — for production, consider httpOnly cookies instead.
- Search, image upload (Cloudinary), and SEO meta tags are natural next features once this base is working.
