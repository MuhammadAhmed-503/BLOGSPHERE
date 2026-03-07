# Production Deployment Guide

## Vercel Deployment (Recommended)

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- MongoDB Atlas cluster
- SMTP credentials

### Step-by-Step Deployment

#### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial production deployment"

# Add remote repository
git remote add origin https://github.com/yourusername/blog-saas.git

# Push to repository
git push -u origin main
```

#### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### 3. Configure Environment Variables

In Vercel project settings, add these environment variables:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/blog-saas?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>

# Admin Credentials (Change these!)
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=<strong-password>

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourdomain.com

# Web Push
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-vapid-key
VAPID_PRIVATE_KEY=your-private-vapid-key
VAPID_SUBJECT=mailto:admin@yourdomain.com

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Your Blog Name
```

#### 4. Deploy

Click "Deploy" and wait for the build to complete.

#### 5. Post-Deployment Checklist

- [ ] Test admin login
- [ ] Create a test blog post
- [ ] Test email subscription
- [ ] Test comment system
- [ ] Verify sitemap at `/sitemap.xml`
- [ ] Verify robots.txt at `/robots.txt`
- [ ] Test push notifications
- [ ] Check MongoDB indexes are created
- [ ] Verify environment variables
- [ ] Test all API routes

---

## Alternative: Docker Deployment

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      # Add all other environment variables
    restart: unless-stopped
```

### Deploy with Docker

```bash
# Build image
docker build -t blog-saas .

# Run container
docker run -p 3000:3000 --env-file .env.production blog-saas
```

---

## MongoDB Atlas Setup

### 1. Create Cluster
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier)
3. Choose your region (closest to your users)

### 2. Database Access
1. Go to "Database Access"
2. Add a database user
3. Set username and strong password
4. Grant read/write permissions

### 3. Network Access
1. Go to "Network Access"
2. Add IP Address
3. For development: Add current IP
4. For production: Add `0.0.0.0/0` (or Vercel IP ranges)

### 4. Get Connection String
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database password
5. Add database name: `?appName=Cluster0`

---

## Email Setup (Gmail)

### 1. Enable 2-Factor Authentication
1. Go to Google Account settings
2. Security → 2-Step Verification
3. Enable it

### 2. Create App Password
1. Go to Google Account → Security
2. 2-Step Verification → App passwords
3. Select "Mail" and "Other"
4. Generate password
5. Copy the generated password

### 3. Configure Environment
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=<generated-app-password>
SMTP_FROM=noreply@yourdomain.com
```

---

## Cloudinary Setup

### 1. Create Account
1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for free account

### 2. Get Credentials
1. Go to Dashboard
2. Copy:
   - Cloud Name
   - API Key
   - API Secret

### 3. Configure Upload Preset
1. Go to Settings → Upload
2. Add upload preset (unsigned for client uploads)
3. Set folder structure

---

## Custom Domain Setup

### Vercel
1. Go to Project Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Wait for SSL certificate provisioning

### DNS Configuration
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

---

## Performance Optimization

### 1. Enable Edge Caching
Already configured in `next.config.js`

### 2. MongoDB Indexes
Automatically created by Mongoose schemas

### 3. Image Optimization
Use Cloudinary for all images:
```typescript
// Upload to Cloudinary
const uploadToCloudinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'your-preset');
  
  const res = await fetch(
    'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  );
  
  const data = await res.json();
  return data.secure_url;
};
```

### 4. Enable Analytics
Add Vercel Analytics in `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Monitoring & Debugging

### Vercel Logs
- Go to Deployments → Function Logs
- View real-time logs
- Filter by severity

### MongoDB Monitoring
- Go to MongoDB Atlas → Metrics
- Monitor connections, operations, memory
- Set up alerts

### Error Tracking
Add Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

---

## Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong NEXTAUTH_SECRET
- [ ] Enable HTTPS only
- [ ] Set secure CORS policies
- [ ] Implement rate limiting (already done)
- [ ] Sanitize all inputs (already done)
- [ ] Use environment variables for secrets
- [ ] Enable MongoDB authentication
- [ ] Restrict MongoDB network access
- [ ] Regular dependency updates
- [ ] Enable CSP headers
- [ ] Implement CSRF protection (already done)
- [ ] Use bcrypt for passwords (already done)

---

## Backup Strategy

### MongoDB Backups
1. Enable Cloud Backups in Atlas
2. Configure snapshot schedule
3. Set retention policy

### Code Backups
- Use GitHub for version control
- Tag releases
- Keep documentation updated

---

## Scaling Considerations

### Database Scaling
- MongoDB Atlas auto-scaling (M10+)
- Add read replicas
- Implement sharding for 1M+ documents

### Application Scaling
- Vercel auto-scales
- Use Edge Functions for global performance
- Implement caching strategy

### Cost Optimization
- Optimize MongoDB queries
- Use ISR instead of SSR where possible
- Implement proper database indexes
- Compress images
- Use CDN for static assets

---

## Troubleshooting

### Build Failures
```bash
# Clear cache
rm -rf .next
npm run build
```

### Database Connection
```bash
# Test connection
node -e "require('./lib/db').default.then(() => console.log('Connected')).catch(console.error)"
```

### Email Issues
- Check SMTP credentials
- Verify app password
- Check spam folder
- Test with different email provider

---

## Going Live Checklist

- [ ] Environment variables configured
- [ ] Admin user created
- [ ] Test blog post published
- [ ] Email sending works
- [ ] Push notifications configured
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Sitemap accessible
- [ ] Robots.txt configured
- [ ] Analytics enabled
- [ ] Error tracking setup
- [ ] Backups configured
- [ ] Monitoring alerts set
- [ ] Documentation updated
- [ ] Team access configured
