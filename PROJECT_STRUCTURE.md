# Project Structure

## Directory Overview

```
Blog Saas/
│
├── app/                          # Next.js 14 App Router
│   ├── (public)/                 # Public-facing pages (no auth required)
│   │   ├── layout.tsx            # Public layout with navigation & footer
│   │   ├── page.tsx              # Homepage (featured, latest, trending blogs)
│   │   ├── blog/
│   │   │   ├── page.tsx          # Blog listing with filters
│   │   │   └── [slug]/
│   │   │       └── page.tsx      # Individual blog post detail
│   │   ├── about/
│   │   │   └── page.tsx          # About page
│   │   └── subscribe/
│   │       └── page.tsx          # Email subscription page
│   │
│   ├── admin/                    # Admin dashboard (auth required)
│   │   ├── layout.tsx            # Admin layout with sidebar
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Analytics dashboard
│   │   └── login/
│   │       └── page.tsx          # Admin login
│   │
│   ├── api/                      # API Routes (Next.js Route Handlers)
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth handler
│   │   ├── blogs/
│   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   ├── [slug]/
│   │   │   │   ├── route.ts      # GET single blog
│   │   │   │   └── view/
│   │   │   │       └── route.ts  # POST increment views
│   │   │   └── edit/
│   │   │       └── [id]/
│   │   │           └── route.ts  # PUT, DELETE (admin)
│   │   ├── search/
│   │   │   └── route.ts          # GET search blogs
│   │   ├── comments/
│   │   │   ├── route.ts          # GET, POST
│   │   │   └── [id]/
│   │   │       ├── route.ts      # DELETE
│   │   │       └── approve/
│   │   │           └── route.ts  # PUT approve
│   │   ├── subscribers/
│   │   │   ├── route.ts          # GET (admin), POST
│   │   │   ├── verify/
│   │   │   │   └── route.ts      # GET verification
│   │   │   ├── unsubscribe/
│   │   │   │   └── route.ts      # POST unsubscribe
│   │   │   └── notify/
│   │   │       └── route.ts      # POST notify all
│   │   ├── push/
│   │   │   ├── subscribe/
│   │   │   │   └── route.ts      # POST store push subscription
│   │   │   └── send/
│   │   │       └── route.ts      # POST send push notification
│   │   └── admin/
│   │       └── analytics/
│   │           └── route.ts      # GET analytics data
│   │
│   ├── layout.tsx                # Root layout (theme provider, metadata)
│   ├── globals.css               # Global styles (Tailwind + custom)
│   ├── sitemap.ts                # Dynamic sitemap generation
│   ├── robots.ts                 # robots.txt configuration
│   ├── opengraph-image.tsx       # OpenGraph image generator
│   └── not-found.tsx             # 404 page
│
├── components/                   # Reusable React components
│   ├── Navigation.tsx            # Header with dark mode toggle
│   ├── Footer.tsx                # Footer with links
│   └── SubscribeForm.tsx         # Email subscription form
│
├── lib/                          # Core utilities & business logic
│   ├── env.ts                    # Environment variable validation (Zod)
│   ├── db.ts                     # MongoDB connection manager
│   ├── auth.ts                   # NextAuth configuration
│   ├── init-admin.ts             # Admin initialization script
│   ├── rate-limit.ts             # In-memory rate limiting
│   ├── security.ts               # Sanitization & validation utilities
│   ├── api-response.ts           # Standardized API responses
│   ├── utils.ts                  # General utilities (slug, dates, etc.)
│   ├── blog-service.ts           # Blog business logic
│   ├── comment-service.ts        # Comment business logic
│   ├── subscriber-service.ts     # Subscriber business logic
│   ├── email.ts                  # Email sending utilities
│   ├── push-notification.ts      # Push notification service
│   └── push-client.ts            # Client-side push utilities
│
├── models/                       # Mongoose schemas
│   ├── User.ts                   # User schema (admin)
│   ├── Blog.ts                   # Blog post schema
│   ├── Comment.ts                # Comment schema
│   ├── Subscriber.ts             # Email subscriber schema
│   └── index.ts                  # Model exports
│
├── public/                       # Static assets
│   └── sw.js                     # Service worker (push notifications)
│
├── middleware.ts                 # Next.js middleware (auth protection)
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
├── .eslintrc.js                  # ESLint configuration
├── .gitignore                    # Git ignore patterns
├── .env.example                  # Environment variable template
├── .env.local                    # Actual environment variables (gitignored)
├── README.md                     # Project documentation
├── DEPLOYMENT.md                 # Deployment guide
├── SCALING.md                    # Scaling guide
└── PROJECT_STRUCTURE.md          # This file
```

## Key Patterns & Conventions

### Route Groups
- `(public)`: Public-facing pages, requires Navigation + Footer layout
- `admin`: Protected admin pages, requires authentication

### API Route Naming
- `route.ts`: Handles HTTP methods (GET, POST, PUT, DELETE)
- Dynamic segments: `[slug]`, `[id]`

### Service Layer Pattern
```
API Route → Service → Model → Database
```
- **API Routes**: Handle HTTP, validation, auth
- **Services**: Business logic, complex queries
- **Models**: Data structure, basic queries

### Component Organization
- Server Components by default
- `'use client'` directive for interactivity
- Co-locate related components

## Important Files Explained

### Configuration Files

**next.config.js**
- Security headers (CSP, XSS protection)
- Image optimization settings
- Standalone output for Docker

**tailwind.config.js**
- Dark mode configuration
- Custom color palette
- Typography plugin for blog content

**tsconfig.json**
- Strict mode enabled
- Path aliases (@/* → ./*)
- ES2021 target

### Core Library Files

**lib/db.ts**
- Connection pooling (min:2, max:10)
- Singleton pattern to prevent multiple connections
- Graceful shutdown handlers

**lib/env.ts**
- Runtime environment validation
- Zod schema ensures all required vars exist
- Type-safe environment access

**lib/security.ts**
- HTML sanitization (XSS prevention)
- Input validation helpers
- Token generation utilities

### Models

**models/Blog.ts**
- Compound indexes for performance:
  - `{ isPublished: 1, publishedAt: -1 }`
  - `{ isPublished: 1, views: -1 }`
  - `{ category: 1, isPublished: 1 }`
  - `{ tags: 1, isPublished: 1 }`
- Text indexes for search
- Pre-save hooks for slug generation

**models/Comment.ts**
- Supports nested replies via `parentCommentId`
- Approval workflow with `isApproved`
- Cascading deletes for entire thread

### Service Layers

**lib/blog-service.ts**
Methods:
- `createBlog`: Auto-generates slug, calculates reading time
- `updateBlog`: Partial updates with validation
- `deleteBlog`: Removes blog and associated comments
- `getBlogs`: Pagination, filtering, sorting
- `getTrendingBlogs`: Sorts by views, recent posts prioritized
- `getRelatedBlogs`: Finds similar by tags/category

**lib/subscriber-service.ts**
Methods:
- `subscribe`: Double opt-in, sends verification email
- `verifyEmail`: Confirms subscription
- `unsubscribe`: Removes subscription
- `getActiveSubscribers`: Fetches verified subscribers
- `storePushSubscription`: Saves web push endpoint

## Data Flow Examples

### Creating a Blog Post

```
1. Admin submits form → POST /api/blogs
2. Middleware checks authentication
3. Route handler validates with Zod
4. BlogService.createBlog() called
5. Slug generated from title
6. Reading time calculated from content
7. Blog saved to MongoDB
8. Response returned with new blog data
```

### Subscribing to Newsletter

```
1. User submits email → POST /api/subscribers
2. Rate limiting checks (3 req/min)
3. Input sanitized
4. SubscriberService.subscribe() called
5. Verification token generated
6. Email sent with verification link
7. User clicks link → GET /api/subscribers/verify
8. Subscription confirmed
```

### Viewing a Blog Post

```
1. User visits /blog/[slug]
2. Server component fetches blog data (ISR cached for 1 hour)
3. generateMetadata creates OpenGraph tags
4. Page renders with markdown content
5. Client-side view tracking triggered
6. POST /api/blogs/[slug]/view increments counter (rate limited)
```

## Performance Considerations

### Server-Side Rendering (SSR)
- Used sparingly, mainly admin pages
- Most pages use ISR (Incremental Static Regeneration)

### ISR Configuration
- Homepage: `revalidate: 60` (1 minute)
- Blog listing: `revalidate: 300` (5 minutes)
- Blog detail: `revalidate: 3600` (1 hour)

### Database Query Optimization
- Always use `.lean()` for read-only queries
- Use `.select()` to fetch only needed fields
- Leverage compound indexes for common queries
- Connection pooling prevents connection exhaustion

### Caching Strategy
- Static assets: Cached by Vercel CDN
- API responses: ISR + cache headers
- Database queries: Mongoose built-in caching

## Security Layers

1. **Input Validation**: Zod schemas for all inputs
2. **Sanitization**: DOMPurify for HTML content
3. **Authentication**: NextAuth with JWT
4. **Authorization**: Role-based access control
5. **Rate Limiting**: In-memory store per IP
6. **CSRF Protection**: NextAuth built-in
7. **XSS Protection**: Security headers + sanitization
8. **SQL Injection**: N/A (NoSQL with Mongoose ODM)
9. **Password Security**: bcrypt with 12 rounds
10. **Environment Variables**: Never exposed to client

## Extensibility

### Adding a New Feature

1. **Create Model** (if needed): `models/Feature.ts`
2. **Create Service**: `lib/feature-service.ts`
3. **Create API Routes**: `app/api/features/route.ts`
4. **Create UI Pages**: `app/(public)/features/page.tsx`
5. **Update Navigation**: Add links in `components/Navigation.tsx`

### Adding a New API Endpoint

```typescript
// app/api/example/route.ts
import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    // Your logic here
    return successResponse({ data: 'Hello' });
  } catch (error) {
    return errorResponse('Something went wrong');
  }
}
```

## Testing Strategy (Future)

### Unit Tests
- Test service layer functions
- Use Jest + MongoDB Memory Server
- Mock external dependencies

### Integration Tests
- Test API routes end-to-end
- Use Supertest or Playwright
- Test with real test database

### E2E Tests
- Test critical user flows
- Use Playwright or Cypress
- Test in staging environment

## Conclusion

This project follows industry best practices:
- ✅ Separation of concerns (MVC-like pattern)
- ✅ Type safety (TypeScript strict mode)
- ✅ Security first (multiple layers)
- ✅ Performance optimized (indexes, caching, ISR)
- ✅ Scalable architecture (service layer, connection pooling)
- ✅ Maintainable code (modular, documented)
