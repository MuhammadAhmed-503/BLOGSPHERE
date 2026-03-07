# MongoDB Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. IP Whitelist Error ⚠️

**Error Message:**
```
Error: Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

**Solution:**
1. Go to [MongoDB Atlas Cloud Console](https://cloud.mongodb.com)
2. Select your cluster
3. Navigate to **Security → Network Access** (left sidebar)
4. Click **"Add IP Address"** button
5. Choose one of the following options:
   - **Add Current IP Address** - Atlas will auto-detect your IP
   - **Allow Access from Anywhere** - Use `0.0.0.0/0` (⚠️ **NOT recommended for production**)
   - **Manual Entry** - Enter your specific IP address
6. Add a description (e.g., "Development Machine")
7. Click **Confirm**
8. **Wait 1-2 minutes** for changes to propagate
9. Restart your application

**For Dynamic IPs:**
If your IP changes frequently (home internet, coffee shops):
- Consider using `0.0.0.0/0` for development only
- For production, use a static IP or VPN
- Use MongoDB's connection from cloud platforms (Vercel, Railway, etc.) which have stable IPs

---

### 2. Authentication Error 🔑

**Error Message:**
```
Authentication failed
MongoServerError: bad auth
```

**Solution:**
1. Verify your MongoDB URI in `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE?retryWrites=true&w=majority
   ```

2. Check credentials:
   - Username and password should match your MongoDB Atlas database user
   - **Not your Atlas account login credentials!**

3. **URL-encode special characters** in password:
   - `@` → `%40`
   - `:` → `%3A`
   - `/` → `%2F`
   - `?` → `%3F`
   - `#` → `%23`
   - `&` → `%26`
   
   Example: Password `P@ss:word` becomes `P%40ss%3Aword`

4. Create a new database user:
   - Go to **Security → Database Access**
   - Click **"Add New Database User"**
   - Choose password authentication
   - Grant appropriate privileges (e.g., "Atlas admin" or "Read and write to any database")
   - Update your `.env.local` with new credentials

---

### 3. Network/DNS Error 🌐

**Error Message:**
```
MongooseServerSelectionError: getaddrinfo ENOTFOUND
```

**Solution:**
1. **Check your internet connection**
2. **Verify MongoDB URI format:**
   ```
   mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE
   ```
3. **Ensure cluster is running** (not paused in Atlas)
4. **Check firewall settings:**
   - Corporate/school networks may block MongoDB ports
   - Try using mobile hotspot to test
5. **DNS Issues:**
   - Try flushing DNS cache: `ipconfig /flushdns` (Windows)
   - Restart your computer/router

---

### 4. Connection Timeout ⏱️

**Error Message:**
```
MongooseServerSelectionError: Server selection timed out
```

**Solution:**
1. Increase timeout in connection options (already configured in `lib/db.ts`)
2. Check if MongoDB Atlas cluster is in same/close region to you
3. Verify cluster is not overloaded (check Atlas metrics)
4. Ensure you have stable internet connection

---

## Verifying Your Setup

### Step 1: Check Environment Variables
Create `.env.local` file in project root if it doesn't exist:

```bash
# Copy from example
cp .env.example .env.local
```

### Step 2: Update MongoDB URI
Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE?retryWrites=true&w=majority
```

Replace:
- `YOUR_USERNAME` - Database user (not Atlas account email)
- `YOUR_PASSWORD` - Database password (URL-encoded if contains special chars)
- `YOUR_CLUSTER` - Your cluster address from Atlas
- `YOUR_DATABASE` - Database name (e.g., "blog-saas")

### Step 3: Test Connection
Run your development server:
```bash
npm run dev
```

Look for:
- ✅ `MongoDB connected successfully` - Connection successful!
- ❌ Error messages - See solutions above

---

## Quick Checklist ✓

- [ ] IP address whitelisted in MongoDB Atlas Network Access
- [ ] Database user created with correct privileges
- [ ] Password URL-encoded if contains special characters
- [ ] MongoDB URI in `.env.local` is correct
- [ ] Cluster is running (not paused)
- [ ] Internet connection is stable
- [ ] No restrictive firewall blocking MongoDB

---

## Still Having Issues?

1. **Test connection string directly:**
   - Use MongoDB Compass or mongosh CLI
   - This isolates whether issue is with MongoDB or your app

2. **Check MongoDB Atlas Status:**
   - [Atlas Status Page](https://status.mongodb.com/)

3. **Review Atlas Activity Feed:**
   - Check for security alerts or connection attempts
   - Available in Atlas dashboard

4. **Enable debug logging:**
   ```typescript
   // Temporarily add to lib/db.ts
   mongoose.set('debug', true);
   ```

5. **Contact Support:**
   - MongoDB Atlas Support (if you have paid plan)
   - Check Next.js/Mongoose documentation
   - Review application logs carefully

---

## Production Considerations

### Security Best Practices:
- ✅ Use specific IP whitelisting (not 0.0.0.0/0)
- ✅ Rotate credentials regularly
- ✅ Use strong passwords (20+ characters)
- ✅ Enable MongoDB Atlas audit logging
- ✅ Use least-privilege database users
- ✅ Enable 2FA on Atlas account

### Performance:
- ✅ Choose cluster region close to your application
- ✅ Set up connection pooling (already configured)
- ✅ Monitor connection metrics in Atlas
- ✅ Scale cluster based on usage

---

**Last Updated:** March 2026
