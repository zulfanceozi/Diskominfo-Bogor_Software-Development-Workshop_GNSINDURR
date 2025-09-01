# 🚨 Vercel PG Package Final Fix - Complete Guide

## 🔍 **Root Cause Analysis**

**Issue**: POST/PATCH methods return 405 Method Not Allowed

**Real Problem**: `pg` package tidak bisa di-load di Vercel serverless environment
```
Error: Please install pg package manually
at ConnectionManager._loadDialectModule (/var/task/node_modules/sequelize/lib/dialects/abstract/connection-manager.js:55:15)
```

**Why GET Works, POST/PATCH Don't**:
- ✅ **GET** `/api/admin/submissions` → **Static/Prerender** (tidak hit database)
- ❌ **POST** `/api/submissions` → **Serverless Function** (hit database, crash karena `pg`)

## 🔧 **Solutions Applied**

### **1. Fixed Next.js Webpack Configuration**

**File**: `next.config.js`
```javascript
webpack: (config, { isServer, dev }) => {
  if (isServer) {
    // Force include pg and related packages
    config.externals = config.externals || [];
    
    // Only exclude sequelize, force include everything else
    config.externals.push({
      sequelize: "commonjs sequelize",
    });

    // Explicitly include pg packages
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      url: false,
      zlib: false,
      http: false,
      https: false,
      assert: false,
      os: false,
      path: false,
    };

    // Ensure pg is not externalized
    if (config.externals) {
      config.externals = config.externals.filter(external => {
        if (typeof external === 'object') {
          return !external.pg && !external['pg-hstore'];
        }
        return external !== 'pg' && external !== 'pg-hstore';
      });
    }
  }
}
```

### **2. Updated Vercel Configuration**

**File**: `vercel.json` ✅ **FIXED**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "installCommand": "npm install",
        "buildCommand": "npm run build",
        "outputDirectory": ".next"
      }
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

**Note**: Removed `functions` property to avoid conflict with `builds` property.

### **3. Updated NPM Configuration**

**File**: `.npmrc`
```
registry=https://registry.npmjs.org/
production=false
save-exact=true
package-lock=true
```

### **4. Restructured API Routes**

**File**: `app/api/submissions/route.js`
```javascript
// Single default export handler
export default async function handler(request, { params }) {
  const method = request.method;
  
  if (method === 'POST') {
    // Handle POST logic
  }
  
  // Return 405 for other methods
  return NextResponse.json({ message: `Method ${method} not allowed` }, { status: 405 });
}
```

## 🚀 **Deployment Steps**

### **Step 1: Force Clear Vercel Cache**
1. Vercel Dashboard → **Settings** → **General**
2. Click **"Clear Build Cache"**
3. Click **"Clear Function Cache"** (if available)

### **Step 2: Force Redeploy**
```bash
git add .
git commit -m "Final fix: Ensure pg package is properly bundled for Vercel"
git push origin main
```

### **Step 3: Monitor Deployment**
- Watch Vercel build logs
- Ensure no build errors
- Wait for deployment completion

## 📋 **Verification Checklist**

### **Before Deployment**
- [ ] `pg` package in `package.json` dependencies
- [ ] `pg-hstore` package in `package.json` dependencies
- [ ] Next.js webpack config excludes `pg` from externals
- [ ] Vercel config properly set (no conflicts)
- [ ] API routes use single default export

### **After Deployment**
- [ ] Vercel cache cleared
- [ ] New deployment completed
- [ ] No build errors in logs
- [ ] Functions tab shows updated routes

### **Testing Results**
- [ ] GET `/api/admin/submissions` returns 200
- [ ] POST `/api/submissions` returns 201 (not 405, not crash)
- [ ] PATCH `/api/admin/submissions/[id]/status` returns 200 (not 405, not crash)

## 🎯 **Expected Results**

### **POST Success Response**:
```json
{
  "message": "Pengajuan berhasil dibuat",
  "tracking_code": "LP-20241201-12345",
  "submission_id": "uuid-here"
}
```

### **PATCH Success Response**:
```json
{
  "message": "Status berhasil diupdate",
  "old_status": "PENGAJUAN_BARU",
  "new_status": "DIPROSES",
  "submission_id": "uuid-here"
}
```

## 🔍 **Debugging Commands**

### **Local Verification**:
```bash
node scripts/verify-pg-install.js
```

### **Test After Deployment**:
```bash
node scripts/test-new-structure.js
```

### **Manual Testing**:
```bash
# Test POST
curl -X POST https://your-app.vercel.app/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test","nik":"1234567890123456","no_wa":"08123456789","jenis_layanan":"KTP","consent":true}'

# Test PATCH
curl -X PATCH https://your-app.vercel.app/api/admin/submissions/[ID]/status \
  -H "Content-Type: application/json" \
  -d '{"status":"DIPROSES"}'
```

## 📚 **Technical Details**

### **Why This Happens**
- Vercel serverless functions have different module resolution
- `pg` package needs special handling in webpack
- External packages can cause runtime errors

### **Solution Explanation**
- Force include `pg` in webpack bundle
- Remove `pg` from externals
- Ensure proper fallback configuration
- Use single default export for API routes

### **Performance Impact**
- ✅ **Better**: `pg` available at runtime
- ✅ **Better**: No more function crashes
- ✅ **Better**: Proper database connections

## 📞 **If Still Not Working**

### **1. Check Vercel Build Logs**
- Look for webpack bundling errors
- Check if `pg` is being excluded
- Verify no import/export errors

### **2. Try Alternative Solutions**
- **Different Region**: Deploy to different Vercel region
- **New Project**: Create fresh Vercel project
- **Contact Support**: If all solutions fail

## 🎉 **Success Indicators**

After successful fix:
- ✅ **POST** methods work (201 Created)
- ✅ **PATCH** methods work (200 OK)
- ✅ **No more crashes** (exit code 0)
- ✅ **Database connections** work properly
- ✅ **All HTTP methods** return proper status codes

---

**Note**: This is the final and most comprehensive fix for the pg package issue on Vercel. The combination of webpack configuration, Vercel settings, and API route restructuring should resolve the 405 Method Not Allowed errors.
