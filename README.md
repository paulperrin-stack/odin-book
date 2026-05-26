# odinbook

A full-stack social media application — the capstone project of
[The Odin Project](https://www.theodinproject.com/lessons/node-path-nodejs-odin-book)'s
Node.js course. Users can post, like, comment, follow each other, and browse a
feed of posts from the people they follow.

> **Live demo:** _add your deployed URL here_

## Features

- **Authentication** — email/password (Passport local) and GitHub OAuth, with
  PostgreSQL-backed sessions
- **Posts** — create, view, and delete text posts
- **Feed** — posts from you and the people you follow, newest first
- **Likes** — like and unlike any post
- **Comments** — comment on posts and delete your own comments
- **Following** — send follow requests, accept or decline incoming requests,
  unfollow
- **Profiles** — profile page with avatar, bio, post/follower/following counts,
  and the user's posts
- **People directory** — browse all users with follow buttons that reflect the
  current relationship

## Tech stack

**Backend** — Node.js, Express, PostgreSQL, Prisma, Passport
(`passport-local`, `passport-github2`), `express-session` with
`connect-pg-simple`, bcrypt

**Frontend** — React, Vite, React Router, date-fns

## Project structure

```
odin-book/
├── backend/    Express API, Prisma schema and migrations
└── frontend/   React + Vite single-page app
```

## Getting started

### Prerequisites

- Node.js 20+
- A PostgreSQL database

### Backend

```bash
cd backend
npm install
cp .env.example .env      # then fill in the values below
npx prisma migrate dev    # run migrations
npx prisma db seed        # optional: populate sample data
npm run dev
```

`backend/.env`:

| Variable               | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string                       |
| `PORT`                 | API port (default 3000)                            |
| `SESSION_SECRET`       | Secret used to sign the session cookie             |
| `CORS_ORIGIN`          | Frontend origin, e.g. `http://localhost:5173`      |
| `NODE_ENV`             | `development` or `production`                      |
| `GITHUB_CLIENT_ID`     | GitHub OAuth app client ID                         |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth app client secret                     |
| `GITHUB_CALLBACK_URL`  | `http://localhost:3000/api/auth/github/callback`   |
| `FRONTEND_URL`         | Where to redirect after GitHub login               |

### Frontend

```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
```

The app runs at `http://localhost:5173`.

## API overview

| Method | Endpoint                          | Description                       |
| ------ | --------------------------------- | --------------------------------- |
| POST   | `/api/auth/register`              | Register and log in               |
| POST   | `/api/auth/login`                 | Log in                            |
| POST   | `/api/auth/logout`                | Log out                           |
| GET    | `/api/auth/me`                    | Current user                      |
| GET    | `/api/auth/github`                | Start GitHub OAuth                 |
| GET    | `/api/posts/feed`                 | Feed for the current user         |
| POST   | `/api/posts`                      | Create a post                     |
| GET    | `/api/posts/:id`                  | Get a post                        |
| DELETE | `/api/posts/:id`                  | Delete a post                     |
| POST   | `/api/posts/:id/like`             | Like a post                       |
| DELETE | `/api/posts/:id/like`             | Unlike a post                     |
| POST   | `/api/posts/:id/comments`         | Add a comment                     |
| GET    | `/api/posts/:id/comments`         | List a post's comments            |
| DELETE | `/api/comments/:id`               | Delete a comment                  |
| GET    | `/api/users`                      | List users                        |
| GET    | `/api/users/:username`            | Get a profile                     |
| GET    | `/api/users/:username/posts`      | A user's posts                    |
| PATCH  | `/api/users/me`                   | Update own profile                |
| POST   | `/api/users/:username/follow`     | Send a follow request             |
| DELETE | `/api/users/:username/follow`     | Unfollow / cancel request         |
| GET    | `/api/follows/pending`            | Incoming follow requests          |
| POST   | `/api/follows/:id/accept`         | Accept a follow request           |
| DELETE | `/api/follows/:id`                | Decline a follow request          |

All routes except registration, login, and the GitHub OAuth flow require an
authenticated session.

## License

MIT — see [LICENSE](./LICENSE).