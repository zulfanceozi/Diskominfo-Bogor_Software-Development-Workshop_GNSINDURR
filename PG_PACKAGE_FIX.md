# 🚨 PostgreSQL Package Issue - Fix Guide

## 🔍 **Problem Analysis**

**Error**: `Failed to create Sequelize instance: Error: Please install pg package manually`

**Root Cause**: Vercel tidak mengenali package `pg` (PostgreSQL driver) saat runtime, meskipun sudah ter-install di `package.json`.

## ✅ **Local Test Results**

Package `pg` berfungsi dengan baik di local:
- ✅ Package loaded successfully
- ✅ Sequelize instance created
- ✅ Database connection successful
- ✅ Query successful

## 🔧 **Solutions Applied**

### **1. Fixed Next.js Configuration**

**Before** (problematic):
```javascript
webpack: (config, { isServer, dev }) => {
  if (isServer) {
    config.externals.push({
      pg: "commonjs pg",           // ❌ Excluded from bundle
      "pg-hstore": "commonjs pg-hstore",
      sequelize: "commonjs sequelize",
    });
    
    config.resolve.fallback = {
      pg: false,                   // ❌ Disabled pg
      "pg-hstore": false,
    };
  }
}
```

**After** (fixed):
```javascript
webpack: (config, { isServer, dev }) => {
  if (isServer) {
    config.externals = config.externals || [];
    
    // Only exclude non-essential packages
    config.externals.push({
      sequelize: "commonjs sequelize",  // ✅ Keep only sequelize
    });

    // Remove pg fallback to include it properly
    config.resolve.fallback = {
      ...config.resolve.fallback,
      // ✅ pg will be included in bundle
    };
  }
}
```

### **2. Updated Experimental Config**

**Before**:
```javascript
experimental: {
  serverComponentsExternalPackages: ["pg", "pg-hstore", "sequelize"],
}
```

**After**:
```javascript
experimental: {
  serverComponentsExternalPackages: ["sequelize"],  // ✅ Only sequelize
}
```

## 🚀 **Deployment Steps**

### **1. Commit Changes**
```bash
git add .
git commit -m "Fix pg package bundling for Vercel deployment"
git push origin main
```

### **2. Clear Vercel Cache**
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **General**
4. Click **"Clear Build Cache"**

### **3. Redeploy**
- Trigger new deployment in Vercel
- Or wait for automatic deployment from git push

### **4. Verify Deployment**
```bash
# Test POST API
curl -X POST https://your-app.vercel.app/api/submissions \
  -H "Content-Type: application/json" \
  -d '{"nama":"Test","nik":"1234567890123456","no_wa":"08123456789","jenis_layanan":"KTP","consent":true}'
```

## 📋 **Verification Checklist**

- [ ] `pg` package in `package.json` dependencies
- [ ] `pg-hstore` package in `package.json` dependencies
- [ ] Next.js config excludes `pg` from externals
- [ ] No `pg: false` in webpack fallback
- [ ] Vercel cache cleared
- [ ] New deployment triggered
- [ ] API POST method works

## 🎯 **Expected Result**

After fix, POST request should return:
```json
{
  "message": "Pengajuan berhasil dibuat",
  "tracking_code": "LP-20241201-12345",
  "submission_id": "uuid-here"
}
```

## 🔍 **Debugging Commands**

### **Local Test**
```bash
node scripts/test-pg.js
```

### **Vercel Test**
```bash
# Check if pg is available in Vercel
curl https://your-app.vercel.app/api/submissions
```

## 📞 **If Still Not Working**

1. **Check Vercel Build Logs**: Look for pg-related errors
2. **Verify Environment Variables**: Ensure `DATABASE_URL` is set
3. **Try Different pg Version**: Update to latest stable version
4. **Contact Vercel Support**: If issue persists

## 📚 **Technical Details**

### **Why This Happens**
- Vercel's serverless environment has different module resolution
- Webpack externals can exclude packages from bundle
- Some packages need to be bundled for serverless functions

### **Solution Explanation**
- Remove `pg` from externals to include it in bundle
- Remove `pg: false` fallback to allow proper loading
- Keep only `sequelize` in external packages

---

**Note**: This is a common issue with Vercel deployments where native packages like `pg` need special handling in the webpack configuration.
