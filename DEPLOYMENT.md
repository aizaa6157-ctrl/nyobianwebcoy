# 🚀 KasirKu Admin - Deployment Guide (100% GRATIS)

Panduan lengkap deploy admin dashboard dengan **$0/bulan** menggunakan Vercel + Neon (FREE tier).

---

## 📋 Prerequisites
- Akun GitHub (gratis)
- Akun Vercel (gratis)
- Akun Neon (gratis) - PostgreSQL serverless
- 15 menit waktu setup

---

## 🎯 Step 1: Setup Neon Database (FREE)

### 1.1. Create Account & Project
1. Buka https://neon.tech
2. Click **"Sign Up"** → Login dengan GitHub
3. Click **"Create a project"**
   - Name: `kasirku-license`
   - Region: **AWS Asia Pacific (Singapore)** (terdekat dengan Indonesia)
   - Compute: **Shared** (FREE)
4. Click **"Create project"** → Tunggu 1 menit

### 1.2. Get Connection String
1. Di Neon Dashboard, pilih project yang baru dibuat
2. Klik **"Connection Details"** atau scroll ke bawah
3. Pilih **"Pooled connection"** (⚠️ IMPORTANT!)
4. Copy **Connection string** (format: `postgresql://neondb_owner:npg_xxx@ep-xxx-pooler...`)
5. **Save** connection string ini untuk step berikutnya

### 1.3. Run Database Schema
1. Di Neon Dashboard, buka **SQL Editor** (sidebar kiri)
2. Click **"New Query"**
3. Copy semua isi file `/supabase/schema-neon.sql`
4. Paste ke SQL Editor
5. Click **"Run"** 
6. Lihat output: ✅ Tables created successfully!

---

## 🎯 Step 2: Setup Vercel (Hosting - FREE)

### 2.1. Push Code ke GitHub
```bash
# Di folder kasirku-admin
git init
git add .
git commit -m "Initial admin dashboard"
git branch -M main
git remote add origin https://github.com/USERNAME/kasirku-admin.git
git push -u origin main
```

### 2.2. Deploy ke Vercel
1. Buka https://vercel.com
2. Login dengan GitHub
3. Click **"Add New..."** → **"Project"**
4. Import repository `kasirku-admin`
5. Configure project:
   - **Framework Preset**: Next.js (auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   
6. **Environment Variables** (⚠️ SANGAT PENTING!):
   Click **"Environment Variables"**, tambahkan:
   
   ```
   Name: DATABASE_URL
   Value: postgresql://neondb_owner:npg_xxx@ep-xxx-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   Environment: Production (centang)
   
   Name: ADMIN_USERNAME
   Value: admin
   Environment: Production (centang)
   
   Name: ADMIN_PASSWORD
   Value: admin123
   Environment: Production (centang)
   ```
   
   ⚠️ **PENTING**: Ganti `DATABASE_URL` dengan connection string dari Neon (step 1.2)
   ⚠️ **PENTING**: Ganti `ADMIN_PASSWORD` dengan password kuat!

7. Click **"Deploy"** → Tunggu 2-3 menit
8. 🎉 Done! URL: `https://kasirku-admin-xxx.vercel.app`

---

## 🎯 Step 3: Update App Config

### 3.1. Update API URL di App
Edit file: `kasirku-app/src/services/licenseService.ts`

```typescript
// Ganti dengan URL Vercel kamu
const API_URL = 'https://kasirku-admin-xxx.vercel.app/api';
```

### 3.2. Test Activation Flow
1. Build app: `cd kasirku-app && npm run android`
2. Buka admin dashboard: Login → Generate license
3. Copy license key
4. Di app, paste license key → Click "Aktivasi"
5. ✅ Harus success: "Aktivasi berhasil!"

---

## 🎯 Step 4: Generate License Keys

### 4.1. Akses Admin Dashboard
1. Buka URL Vercel: `https://kasirku-admin-xxx.vercel.app`
2. Login dengan:
   - Username: `admin`
   - Password: (yang kamu set di env variable)
3. Dashboard akan muncul

### 4.2. Generate License
1. Click button **"+ Generate License"**
2. License key akan muncul: `KASIR-XXXX-YYYY-ZZZZ`
3. Copy key → Kirim ke customer via WhatsApp
4. Customer input key di app → Aktivasi → Done!

### 4.3. Customer Support Actions
- **Reset Device**: Jika customer ganti HP, click "Reset" → License bisa dipakai di device baru
- **Revoke License**: Jika ada abuse/resell, click "Revoke" → License mati permanent

---

## 📊 FREE Tier Limits

### Vercel (Hosting)
- ✅ Unlimited requests
- ✅ 100GB bandwidth/month
- ✅ Auto SSL (HTTPS)
- ✅ Custom domain (optional)
- **Limit**: Cukup untuk ~10,000 activations/month

### Neon (Database)
- ✅ 512MB database storage (FREE)
- ✅ 1 project (FREE)
- ✅ Unlimited queries
- ✅ Auto-scaling compute
- **Limit**: Cukup untuk ~100,000 licenses

**Kesimpulan**: Limits ini **lebih dari cukup** untuk seller UMKM. Bahkan untuk 1000+ penjualan/bulan masih aman.

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Sudah tersimpan aman di Vercel
- ⚠️ **JANGAN** commit `.env` ke Git
- ⚠️ **JANGAN** share `DATABASE_URL` ke siapapun

### 2. API Security
- ✅ Device locking (1 license = 1 device)
- ✅ License validation di server-side
- ✅ HTTPS only (Vercel auto SSL)

### 3. Database Backups
- Neon FREE tier: No auto backups
- **Recommended**: Export data manual setiap bulan
  - Neon Dashboard → SQL Editor → Export to CSV

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not set"
**FIX**:
1. Buka Vercel Dashboard → Project Settings → Environment Variables
2. Pastikan `DATABASE_URL` sudah ditambahkan
3. Value harus **Pooled connection string** dari Neon (yang ada `-pooler` di URL)
4. Environment harus **Production** (centang)
5. Click **Save**
6. Redeploy: Deployments → Latest → ... (3 dots) → Redeploy

### Error: "Cannot connect to database"
- Check connection string format (harus ada `?sslmode=require` di akhir)
- Pastikan pakai **Pooled connection** (bukan Direct)
- Test connection di Neon SQL Editor dulu

### Error: "License not found" di App
- Generate license dulu di admin dashboard
- Check typo di license key (format: KASIR-XXXX-YYYY-ZZZZ)
- Pastikan database schema sudah di-run

### Error: "Network request failed" di App
- Check API_URL di `licenseService.ts`
- Pastikan URL Vercel bisa diakses (buka di browser)
- Check internet connection di device

### Admin Dashboard Login Failed
- Check `ADMIN_USERNAME` dan `ADMIN_PASSWORD` di Vercel env vars
- Pastikan tidak ada spasi di awal/akhir value
- Case-sensitive!

---

## 🔄 Update & Maintenance

### Update Admin Code
```bash
git add .
git commit -m "Update admin features"
git push origin main
```
→ Vercel akan auto-deploy (1-2 menit)

### Update Database Schema
1. Buka Neon SQL Editor
2. Run ALTER TABLE atau migration SQL
3. ✅ Done! No downtime

### Monitor Usage
- **Vercel**: Dashboard → Analytics
- **Neon**: Dashboard → Monitoring

---

## 💰 Scaling (Jika Sukses Besar)

Jika penjualan > 5000/bulan:

### Option 1: Upgrade Neon ($19/month)
- 10GB database storage (20x lipat)
- 300 compute hours
- Daily backups
- **Recommended** jika database mulai penuh

### Option 2: Upgrade Vercel ($20/month)
- 1TB bandwidth (10x lipat)
- Priority support
- Advanced analytics
- **Recommended** jika traffic tinggi

**Tapi** untuk awal (< 1000 sales/month), **FREE tier lebih dari cukup!**

---

## ✅ Checklist Deployment

- [ ] Neon account created
- [ ] Database project created
- [ ] Connection string copied (POOLED!)
- [ ] Database schema executed
- [ ] GitHub repo created
- [ ] Vercel account created
- [ ] Environment variables configured (DATABASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD)
- [ ] First deployment success
- [ ] Admin dashboard accessible
- [ ] Login berhasil
- [ ] Test license generated
- [ ] App API URL updated
- [ ] Test activation success
- [ ] 🎉 Ready to sell!

---

**Total Setup Time**: ~15 menit  
**Total Cost**: $0/bulan  
**Maintenance**: ~5 menit/bulan (check logs)

Selamat jualan! 🚀

### 1.1. Create Account & Project
1. Buka https://supabase.com
2. Click **"Start your project"** → Login dengan GitHub
3. Click **"New Project"**
   - Name: `kasirku-license`
   - Database Password: (buat password kuat, save!)
   - Region: **Singapore** atau **Tokyo** (terdekat dengan Indonesia)
   - Pricing Plan: **FREE** (sudah tercentang default)
4. Click **"Create new project"** → Tunggu 2-3 menit

### 1.2. Run Database Schema
1. Di Supabase Dashboard, buka **SQL Editor** (sidebar kiri)
2. Click **"New Query"**
3. Copy semua isi file `/supabase/schema.sql`
4. Paste ke SQL Editor
5. Click **"Run"** (Ctrl+Enter)
6. Lihat output: ✅ "License system database setup completed!"

### 1.3. Get API Credentials
1. Buka **Project Settings** (⚙️ icon di sidebar)
2. Pilih **API** tab
3. Copy 3 values ini:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGc...` (public key)
   - **service_role**: `eyJhbGc...` (⚠️ SECRET! Jangan share!)

---

## 🎯 Step 2: Setup Vercel (Hosting - FREE)

### 2.1. Push Code ke GitHub
```bash
# Di folder kasirku-admin
git init
git add .
git commit -m "Initial admin dashboard"
git branch -M main
git remote add origin https://github.com/USERNAME/kasirku-admin.git
git push -u origin main
```

### 2.2. Deploy ke Vercel
1. Buka https://vercel.com
2. Login dengan GitHub
3. Click **"Add New..."** → **"Project"**
4. Import repository `kasirku-admin`
5. Configure project:
   - **Framework Preset**: Next.js (auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   
6. **Environment Variables** (PENTING!):
   Click **"Environment Variables"**, tambahkan:
   
   ```
   NEXT_PUBLIC_SUPABASE_URL
   https://xxx.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   eyJhbGc... (anon key dari Supabase)
   
   SUPABASE_SERVICE_ROLE_KEY
   eyJhbGc... (service_role key dari Supabase)
   ```

7. Click **"Deploy"** → Tunggu 2-3 menit
8. 🎉 Done! URL: `https://kasirku-admin-xxx.vercel.app`

---

## 🎯 Step 3: Update App Config

### 3.1. Update API URL di App
Edit file: `kasirku-app/src/services/licenseService.ts`

```typescript
// Ganti dengan URL Vercel kamu
const API_URL = 'https://kasirku-admin-xxx.vercel.app/api';
```

### 3.2. Test Activation Flow
1. Build app: `cd kasirku-app && npm run android`
2. Buka admin dashboard: Login → Generate license
3. Copy license key
4. Di app, paste license key → Click "Aktivasi"
5. ✅ Harus success: "Aktivasi berhasil!"

---

## 🎯 Step 4: Generate License Keys

### 4.1. Akses Admin Dashboard
1. Buka URL Vercel: `https://kasirku-admin-xxx.vercel.app`
2. Login (jika ada auth)
3. Dashboard akan muncul

### 4.2. Generate License
1. Click button **"+ Generate License"**
2. License key akan muncul: `KASIR-XXXX-YYYY-ZZZZ`
3. Copy key → Kirim ke customer via WhatsApp
4. Customer input key di app → Aktivasi → Done!

### 4.3. Customer Support Actions
- **Reset Device**: Jika customer ganti HP, click "Reset" → License bisa dipakai di device baru
- **Revoke License**: Jika ada abuse/resell, click "Revoke" → License mati permanent

---

## 📊 FREE Tier Limits

### Vercel (Hosting)
- ✅ Unlimited requests
- ✅ 100GB bandwidth/month
- ✅ Auto SSL (HTTPS)
- ✅ Custom domain (optional)
- **Limit**: Cukup untuk ~10,000 activations/month

### Supabase (Database)
- ✅ 500MB database storage
- ✅ 5GB bandwidth/month
- ✅ Unlimited API requests
- ✅ Auto backups (7 days)
- **Limit**: Cukup untuk ~50,000 licenses

**Kesimpulan**: Limits ini **lebih dari cukup** untuk seller UMKM. Bahkan untuk 1000+ penjualan/bulan masih aman.

---

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ Sudah tersimpan aman di Vercel
- ⚠️ **JANGAN** commit `.env` ke Git
- ⚠️ **JANGAN** share `SUPABASE_SERVICE_ROLE_KEY` ke siapapun

### 2. API Security
- ✅ Row Level Security (RLS) sudah aktif di Supabase
- ✅ Rate limiting built-in di Vercel Edge
- ✅ Device locking (1 license = 1 device)

### 3. Database Backups
- Supabase FREE tier: Auto backup 7 hari
- Manual export (optional): SQL Editor → Export to CSV

---

## 🐛 Troubleshooting

### Error: "Cannot connect to database"
- Check environment variables di Vercel
- Pastikan Supabase URL & keys sudah benar
- Re-deploy Vercel: Settings → Redeploy

### Error: "License not found"
- Generate license dulu di admin dashboard
- Check typo di license key (format: KASIR-XXXX-YYYY-ZZZZ)

### Error: "Network request failed" di App
- Check API_URL di `licenseService.ts`
- Pastikan URL Vercel bisa diakses (buka di browser)
- Check internet connection di device

### Admin Dashboard Blank
- Check browser console (F12)
- Pastikan Supabase credentials benar
- Check Vercel deployment logs

---

## 🔄 Update & Maintenance

### Update Admin Code
```bash
git add .
git commit -m "Update admin features"
git push origin main
```
→ Vercel akan auto-deploy (1-2 menit)

### Update Database Schema
1. Buka Supabase SQL Editor
2. Run ALTER TABLE atau migration SQL
3. ✅ Done! No downtime

### Monitor Usage
- **Vercel**: Dashboard → Analytics
- **Supabase**: Dashboard → Database → Usage

---

## 💰 Scaling (Jika Sukses Besar)

Jika penjualan > 1000/bulan dan approaching limits:

### Option 1: Upgrade Supabase ($25/month)
- 8GB database (16x lipat)
- 50GB bandwidth (10x lipat)
- Daily backups
- **Recommended** jika database mulai penuh

### Option 2: Upgrade Vercel ($20/month)
- 1TB bandwidth (10x lipat)
- Priority support
- Advanced analytics
- **Recommended** jika traffic tinggi

**Tapi** untuk awal (< 500 sales/month), **FREE tier lebih dari cukup!**

---

## 📞 Support

Jika ada masalah setup:
1. Check troubleshooting section di atas
2. Check Vercel deployment logs
3. Check Supabase database logs
4. Google error message (biasanya ada solusi)

---

## ✅ Checklist Deployment

- [ ] Supabase account created
- [ ] Database schema executed
- [ ] API credentials copied
- [ ] GitHub repo created
- [ ] Vercel account created
- [ ] Environment variables configured
- [ ] First deployment success
- [ ] Admin dashboard accessible
- [ ] Test license generated
- [ ] App API URL updated
- [ ] Test activation success
- [ ] 🎉 Ready to sell!

---

**Total Setup Time**: ~15 menit  
**Total Cost**: $0/bulan  
**Maintenance**: ~5 menit/bulan (check logs)

Selamat jualan! 🚀
