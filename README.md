# KasirKu Admin Dashboard

Admin dashboard untuk mengelola license KasirKu. **100% GRATIS** hosting dengan Vercel + Supabase.

---

## ✨ Features

- ➕ **Generate License Key** - Buat license baru format `KASIR-XXXX-YYYY-ZZZZ`
- 📊 **Monitor Licenses** - View semua license (Active/Pending/Revoked)
- 🔄 **Reset Device** - Untuk customer yang ganti HP
- 🚫 **Revoke License** - Block license (anti-abuse/resell)
- 📈 **Dashboard Statistics** - Total, Active, Pending, Revoked
- 🔐 **Device Locking** - 1 license = 1 device only
- 📝 **Activation Logs** - Audit trail semua aktivasi (optional)

---

## 🚀 Quick Setup (15 menit - $0 cost)

### Prerequisites
- Akun GitHub (gratis)
- Akun Vercel (gratis)
- Akun Supabase (gratis)

### 1. Setup Supabase (Database)
```bash
1. Buka https://supabase.com → Sign up with GitHub
2. Create New Project:
   - Name: kasirku-license
   - Password: [strong password]
   - Region: Singapore / Tokyo
   - Plan: FREE ✅
   
3. SQL Editor → New Query → Copy paste dari:
   📄 supabase/schema.sql
   
4. Run (Ctrl+Enter) → ✅ Tables created!

5. Copy credentials (Project Settings → API):
   - Project URL: https://xxx.supabase.co
   - anon public key: eyJhbGc...
   - service_role key: eyJhbGc... (⚠️ SECRET!)
```

### 2. Setup Vercel (Hosting)
```bash
1. Push code ke GitHub (if not yet):
   git init
   git add .
   git commit -m "KasirKu admin dashboard"
   git push origin main

2. Buka https://vercel.com → Sign up with GitHub

3. Import Project → Select kasirku-admin repo

4. Configure:
   - Framework: Next.js (auto-detect)
   - Root Directory: ./
   
5. Environment Variables (IMPORTANT!):
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (secret)

6. Deploy → ✅ Live in 2 minutes!
   URL: https://kasirku-admin-xxx.vercel.app
```

### 3. Update App API URL
Edit `kasirku-app/src/services/licenseService.ts`:

```typescript
const API_URL = 'https://kasirku-admin-xxx.vercel.app/api';
```

### 4. Test Activation
```bash
1. Open admin dashboard → Generate license
2. Copy license key (KASIR-XXXX-YYYY-ZZZZ)
3. Open app → Input license key → Activate
4. ✅ Should succeed: "Aktivasi berhasil!"
```

**📖 Detailed Guide**: Lihat `DEPLOYMENT.md` untuk troubleshooting & advanced setup.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Edit .env dengan Supabase credentials
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## 📊 Admin Dashboard Usage

### Generate License Key
1. Click **"+ Generate License"**
2. License key muncul: `KASIR-A7B9-D4F2-X9K1`
3. Copy → Kirim ke customer via WhatsApp
4. Customer input di app → Aktivasi → Done! ✅

### Monitor Licenses
Dashboard menampilkan:
- **Status**: Active / Pending / Revoked
- **Device**: Device name & ID (if activated)
- **Activated**: Tanggal aktivasi
- **Reset Count**: Berapa kali direset

### Reset Device (Customer Support)
**Use Case**: Customer ganti HP baru

1. Find license by key (search table)
2. Click **"Reset Device"** button
3. Confirm → ✅ Device binding cleared
4. License jadi `PENDING` lagi
5. Customer bisa aktivasi di HP baru

**Notes**:
- Reset count akan naik (+1)
- History tetap tersimpan
- Tidak menghapus license

### Revoke License (Anti-Abuse)
**Use Case**: Customer reselling app / abuse detected

1. Find license by key
2. Click **"Revoke"** button
3. Confirm (❗ permanent action!)
4. License jadi `REVOKED` → Tidak bisa dipakai lagi

**Notes**:
- Permanent! Tidak bisa di-unrevoice
- App akan tolak aktivasi (error message)
- Use only jika yakin ada abuse

---

## 🔒 Security

### Environment Variables
- ✅ Disimpan aman di Vercel (encrypted)
- ⚠️ **NEVER** commit `.env` ke Git
- ⚠️ **NEVER** share `SUPABASE_SERVICE_ROLE_KEY`

### Database Security
- ✅ Row Level Security (RLS) aktif
- ✅ Anon users cuma bisa read/update licenses (activation only)
- ✅ Service role (admin API) bisa full access
- ✅ Activation logs untuk audit trail

### API Security
- ✅ Rate limiting (Vercel Edge built-in)
- ✅ HTTPS only (auto SSL dari Vercel)
- ✅ CORS configured
- ✅ License format validation
- ✅ Device locking (1 license = 1 device)

### Backup Strategy
- ✅ Supabase auto backup (7 days retention)
- ✅ Manual export: SQL Editor → Export CSV
- 💡 Recommended: Weekly manual backup (download CSV)

---

## 💰 Pricing & Limits (FREE Tier)

### Vercel (Hosting) - FREE Forever
- ✅ Unlimited requests
- ✅ 100GB bandwidth/month
- ✅ Auto SSL (HTTPS)
- ✅ Custom domain support
- ✅ Auto deployment from Git
- **Estimate**: Support ~10,000 activations/month

### Supabase (Database) - FREE Forever
- ✅ 500MB database storage
- ✅ 5GB bandwidth/month
- ✅ Unlimited API requests
- ✅ Auto backups (7 days)
- ✅ 2 CPU cores
- **Estimate**: Support ~50,000 licenses

### When to Upgrade?
Jika sales > 1000/month dan approaching limits:

**Supabase Pro ($25/month)**:
- 8GB database (16x)
- 50GB bandwidth (10x)
- Daily backups
- Point-in-time recovery

**Vercel Pro ($20/month)**:
- 1TB bandwidth (10x)
- Priority support
- Advanced analytics

**Kesimpulan**: Untuk seller UMKM (< 500 sales/month), **FREE tier lebih dari cukup!**

---

## 🐛 Troubleshooting

### Error: Cannot connect to database
```bash
✅ Check Vercel env variables (Settings → Environment Variables)
✅ Pastikan Supabase URL & keys benar
✅ Re-deploy Vercel (Settings → Deployments → Redeploy)
```

### Error: License not found (404)
```bash
✅ Generate license dulu di admin dashboard
✅ Check typo (format: KASIR-XXXX-YYYY-ZZZZ)
✅ Check database: Supabase → Table Editor → licenses
```

### Admin dashboard blank / white screen
```bash
✅ Open browser console (F12) → Check error
✅ Check Vercel deployment logs
✅ Pastikan all dependencies installed (npm install)
✅ Check .env file (local dev)
```

### API endpoint 404
```bash
✅ API route harus di: app/api/activate/route.ts
✅ Check deployment logs di Vercel
✅ Test endpoint: curl https://your-url.vercel.app/api/activate
```

---

## 📁 Project Structure

```
kasirku-admin/
├── app/
│   ├── api/
│   │   └── activate/
│   │       └── route.ts          # 🔥 Activation API endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # 🎨 Main dashboard UI
├── lib/
│   ├── supabase.ts               # Supabase client
│   ├── license.ts                # License generator
│   └── licenseGenerator.ts       # Bulk generator
├── supabase/
│   └── schema.sql                # 🗄️ Database schema
├── .env.example                  # Environment template
├── .gitignore
├── DEPLOYMENT.md                 # 📖 Detailed deployment guide
├── README.md                     # This file
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔄 Update & Maintenance

### Update Code
```bash
# Make changes → Commit → Push
git add .
git commit -m "Update features"
git push origin main

# Vercel auto-deploy dalam 1-2 menit ✅
```

### Update Database Schema
```bash
1. Buka Supabase SQL Editor
2. Write ALTER TABLE or migration SQL
3. Run → ✅ No downtime!
```

### Monitor Usage
- **Vercel**: Dashboard → Analytics → Bandwidth/requests
- **Supabase**: Dashboard → Database → Usage metrics

### Backup Database
```bash
1. Supabase → Table Editor → licenses
2. Click "..." → Export to CSV
3. Save file (manual backup)

Recommended: Weekly backup
```

---

## 📞 Support

**Technical Issues**:
- Check `DEPLOYMENT.md` (detailed troubleshooting)
- Check Vercel deployment logs
- Check Supabase database logs
- Google error message (usually helpful)

**Questions**:
- GitHub Issues: [Your Repo]
- Email: [Your Email]
- WhatsApp: [Your Number]

---

## 📄 License

Proprietary Software - All Rights Reserved  
Copyright © 2026 [Your Name/Company]

---

## ✅ Setup Checklist

Before selling your first app:

- [ ] Supabase account created & project setup
- [ ] Database schema executed (schema.sql)
- [ ] Supabase credentials copied
- [ ] GitHub repo created & code pushed
- [ ] Vercel account created
- [ ] Vercel project connected to GitHub
- [ ] Environment variables configured in Vercel
- [ ] First deployment successful (check URL works)
- [ ] Admin dashboard accessible
- [ ] Test license generated
- [ ] App API URL updated (licenseService.ts)
- [ ] Test activation from app successful
- [ ] Documentation read (DEPLOYMENT.md)
- [ ] Backup strategy prepared (weekly CSV export)
- [ ] **🎉 Ready to sell!**

---

**Version**: 1.0.0  
**Framework**: Next.js 14 (App Router)  
**Database**: Supabase (PostgreSQL)  
**Hosting**: Vercel  
**Cost**: $0/month (FREE tier)  
**Status**: Production Ready 🚀
