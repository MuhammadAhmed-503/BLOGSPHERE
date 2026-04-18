# BlogSphere SaaS

BlogSphere is a full-stack blogging platform with a Vite + React frontend and an Express + MongoDB backend.

It includes public blog pages, admin content management, comments moderation, newsletter subscriptions, contact messages, media uploads, and optional push notifications.

## Tech Stack

- Frontend: React 18, Vite, Tailwind CSS
- Backend: Express 4, Mongoose, JWT auth
- Database: MongoDB
- Editor: Tiptap rich text editor
- Optional integrations: Cloudinary, SMTP, Google auth, Web Push

## Monorepo Structure

```text
.
|-- backend/
|   |-- server.js
|   |-- src/
|   |   |-- app.js
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- scripts/
|   |   |-- services/
|   |   `-- utils/
|-- frontend/
|   |-- index.html
|   |-- vite.config.js
|   `-- src/
|       |-- components/
|       |-- context/
|       |-- hooks/
|       |-- pages/
|       |-- services/
|       `-- utils/
|-- vercel.json
`-- README.md
```

## Prerequisites

- Node.js 18.17+
- npm 9+
- MongoDB Atlas account or local MongoDB

## Installation

```bash
npm --prefix frontend install
npm --prefix backend install
```

## Environment Variables

The backend loads `.env.local` and `.env` from both the repo root and `backend/`.

You can start from `backend/.env.example` and adjust values.

### Required (backend)

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-saas?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-strong-random-secret
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change-this-password
```

### Common (backend)

```env
PORT=5000
APP_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Optional Integrations (backend)

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Google auth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Web push
VAPID_PUBLIC_KEY=your-public-vapid-key
VAPID_PRIVATE_KEY=your-private-vapid-key
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

### Frontend env (`frontend/.env` or `frontend/.env.local`)

```env
VITE_API_URL=http://localhost:5000/api
```

For Vercel production with rewrites, you can set:

```env
VITE_API_URL=/api
```

## Run Locally

Run frontend and backend in separate terminals:

```bash
# Terminal 1
npm --prefix backend run dev

# Terminal 2
npm --prefix frontend run dev
```

Local URLs:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Available Scripts

### Backend

- `npm --prefix backend run dev` - start backend server
- `npm --prefix backend run start` - start backend server (production style)
- `npm --prefix backend run seed` - seed data
- `npm --prefix backend run reset:views` - reset post view counters

### Frontend

- `npm --prefix frontend run dev` - start Vite dev server
- `npm --prefix frontend run build` - build production frontend
- `npm --prefix frontend run preview` - preview production build
- `npm --prefix frontend run lint` - run eslint

## API Overview

Base URL (local): `http://localhost:5000/api`

### Public routes

- `GET /health`
- `GET /public/settings`
- `GET /public/home`
- `GET /public/posts`
- `GET /public/posts/:slug`
- `GET /public/categories`
- `GET /public/tags`
- `GET /public/posts/:slug/comments`
- `POST /public/posts/:slug/comments`
- `POST /public/newsletter/subscribe`
- `POST /public/newsletter/unsubscribe`
- `POST /contact`

### Auth routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/google`
- `GET /auth/me`
- `POST /auth/logout`

### Admin routes (JWT + admin role)

- `GET /admin/dashboard`
- `GET /admin/posts`
- `POST /admin/posts`
- `GET /admin/posts/:id`
- `PUT /admin/posts/:id`
- `DELETE /admin/posts/:id`
- `PATCH /admin/posts/:id/status`
- `PATCH /admin/posts/:id/publish`
- `PATCH /admin/posts/:id/feature`
- `GET /admin/comments`
- `PATCH /admin/comments/:id/approve`
- `DELETE /admin/comments/:id`
- `GET /admin/settings`
- `PUT /admin/settings`
- Additional admin endpoints exist for users/subscribers/messages/uploads.

## Deployment (Vercel)

This repository includes `vercel.json` configured to:

- install both `frontend` and `backend` dependencies
- build the frontend into `frontend/dist`
- serve API requests via `api/index.js`
- rewrite all non-API routes to the SPA entry

Important environment variables for deployment:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `APP_URL`
- `FRONTEND_URL`
- `VITE_API_URL=/api`

### Quick Deploy Checklist

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel, import the repository as a new project.
3. Keep project root at repository root (same level as `vercel.json`).
4. Add all required environment variables in Vercel Project Settings.
5. Set these production values:
	- `APP_URL=https://your-domain.vercel.app`
	- `FRONTEND_URL=https://your-domain.vercel.app`
	- `VITE_API_URL=/api`
6. Trigger deploy.

### Post-Deploy Verification

Check these endpoints after deployment:

- `GET https://your-domain.vercel.app/api/health`
- `GET https://your-domain.vercel.app/api/public/home`
- Open `https://your-domain.vercel.app` and verify blog list loads.

## Security Notes

- Change default admin credentials before production.
- Use a strong `JWT_SECRET`.
- Restrict CORS origins via `APP_URL` and `FRONTEND_URL`.
- Configure rate limits and SMTP/API credentials per environment.

## License

Private project. Add your preferred license before public distribution.