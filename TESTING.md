# Testing Guide - KasirKu License System

Panduan lengkap untuk testing license system sebelum production.

---

## 🧪 Pre-Production Testing Checklist

### 1. Database Setup Test

**Goal**: Pastikan Supabase database setup dengan benar

```bash
✅ Supabase project created
✅ SQL schema executed (schema.sql)
✅ Tables created: licenses, activation_logs
✅ Indexes created
✅ RLS policies active
✅ Sample data inserted (KASIR-TEST-*)
```

**Verify**:
- Supabase → Table Editor → `licenses` table visible
- Check 2 sample licenses created (status: PENDING)

---

### 2. Admin Dashboard Test

**Goal**: Pastikan admin UI berfungsi sempurna

#### Local Testing
```bash
cd kasirku-admin
npm install
cp .env.example .env
# Edit .env dengan Supabase credentials
npm run dev
```

Open http://localhost:3000

**Test Cases**:
1. ✅ Dashboard loads (no errors)
2. ✅ Statistics show (Total, Active, Pending, Revoked)
3. ✅ License table visible (sample data)
4. ✅ Click "Generate License" → License key muncul
5. ✅ Copy license key → Paste ke notepad (for next test)

---

### 3. API Endpoint Test

**Goal**: Pastikan activation API berfungsi

#### Test Invalid License (404)
```bash
curl -X POST https://your-vercel-url.vercel.app/api/activate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "KASIR-FAKE-1234-5678",
    "deviceId": "test-device-001",
    "deviceName": "Test Device"
  }'

Expected Response:
{
  "success": false,
  "message": "License key tidak ditemukan. Periksa kembali."
}
```

#### Test Valid License (Success)
```bash
# Use license key from admin dashboard
curl -X POST https://your-vercel-url.vercel.app/api/activate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "KASIR-A7B9-D4F2-X9K1",
    "deviceId": "test-device-001",
    "deviceName": "Samsung Galaxy S21"
  }'

Expected Response:
{
  "success": true,
  "message": "Aktivasi berhasil!",
  "token": "eyJ...",
  "licenseInfo": {
    "licenseKey": "KASIR-A7B9-D4F2-X9K1",
    "deviceId": "test-device-001",
    "deviceName": "Samsung Galaxy S21",
    "activatedAt": "2026-01-02T...",
    "status": "ACTIVE"
  }
}
```

#### Test Duplicate Activation (Re-activation same device)
```bash
# Activate again with SAME device ID
curl -X POST https://your-vercel-url.vercel.app/api/activate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "KASIR-A7B9-D4F2-X9K1",
    "deviceId": "test-device-001",
    "deviceName": "Samsung Galaxy S21"
  }'

Expected Response:
{
  "success": true,
  "message": "License sudah aktif di device ini",
  ...
}
```

#### Test Different Device (Should Fail)
```bash
# Activate with DIFFERENT device ID (should be blocked)
curl -X POST https://your-vercel-url.vercel.app/api/activate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "KASIR-A7B9-D4F2-X9K1",
    "deviceId": "test-device-999",
    "deviceName": "iPhone 14"
  }'

Expected Response:
{
  "success": false,
  "message": "License sudah aktif di device lain:\nSamsung Galaxy S21\n\nHubungi penjual untuk reset device."
}
```

---

### 4. App Integration Test

**Goal**: Pastikan app bisa aktivasi dengan benar

#### Update API URL
Edit `kasirku-app/src/services/licenseService.ts`:
```typescript
const API_URL = 'https://your-vercel-url.vercel.app/api';
```

#### Test Flow
```bash
1. Build app: npm run android
2. Buka app di emulator/device
3. ActivationScreen akan muncul (first time)
4. Input license key dari admin dashboard
5. Click "Aktivasi Sekarang"
6. ✅ Should succeed: "Aktivasi Berhasil!"
7. App restart → Langsung ke Dashboard (skip ActivationScreen)
```

#### Test Cases
- ✅ Invalid format → Error: "Format license key tidak valid"
- ✅ Wrong key → Error: "License key tidak ditemukan"
- ✅ Valid key → Success: "Aktivasi berhasil!"
- ✅ App restart → Skip activation (already activated)
- ✅ Offline mode → App works normal (no internet needed)

---

### 5. Device Reset Test

**Goal**: Pastikan reset device berfungsi (customer ganti HP)

#### Steps
```bash
1. Admin Dashboard → Find activated license
2. Click "Reset Device" button
3. Confirm dialog → Yes
4. ✅ Status changed: ACTIVE → PENDING
5. ✅ Device ID & Name cleared
6. ✅ Reset count increased (+1)

7. Test re-activation:
   - Uninstall app dari device lama
   - Install app di device baru (atau emulator lain)
   - Input same license key
   - ✅ Should succeed (dapat aktivasi ulang)
```

---

### 6. Revoke License Test

**Goal**: Pastikan revoke berfungsi (anti-abuse)

#### Steps
```bash
1. Admin Dashboard → Find license (any status)
2. Click "Revoke" button
3. Confirm (⚠️ permanent!)
4. ✅ Status changed: → REVOKED

5. Test activation with revoked license:
   - Uninstall app
   - Reinstall app
   - Input revoked license key
   - ❌ Should fail: "License ini sudah di-revoke. Hubungi penjual."
```

---

### 7. Edge Cases Test

#### Test Format Validation
```bash
# App should reject these:
- "KASIR-123-456-789" (too short)
- "KASIR-AAAA-BBBB" (missing segment)
- "kasir-1234-5678-9012" (lowercase, app auto-convert to uppercase)
- "1234-5678-9012-3456" (missing KASIR prefix)
- "KASIR-O000-I111-1L1L" (confusing chars O, I, L)
```

#### Test Network Errors
```bash
# Simulate offline activation (should fail gracefully)
1. Turn OFF internet/wifi
2. Open app → ActivationScreen
3. Input valid license key
4. Click activate
5. ✅ Error: "Tidak ada koneksi internet. Aktivasi memerlukan internet sekali saja."

# Simulate API down
1. Stop Vercel deployment (or use wrong URL)
2. Try activate
3. ✅ Error: "Terjadi kesalahan. Coba lagi nanti."
```

#### Test Concurrent Activations
```bash
# Try activate same license from 2 devices simultaneously
1. Device A: Input license → Click activate (hold)
2. Device B: Input same license → Click activate (immediately)
3. Expected: One succeeds, other fails (database locking)
```

---

### 8. Performance Test

#### License Generation Speed
```bash
# Generate 100 licenses
Time: < 1 second ✅

# Generate 1000 licenses
Time: < 5 seconds ✅
```

#### API Response Time
```bash
# Activation request
Average: 200-500ms ✅
Max acceptable: < 2 seconds
```

#### Database Query Performance
```bash
# Load 1000 licenses in dashboard
Time: < 1 second ✅

# Search by license key
Time: < 100ms ✅ (indexed)
```

---

### 9. Security Test

#### SQL Injection Test
```bash
# Try inject malicious input
curl -X POST https://your-url.vercel.app/api/activate \
  -H "Content-Type: application/json" \
  -d '{
    "licenseKey": "KASIR-1234'\'' OR 1=1--",
    "deviceId": "test",
    "deviceName": "test"
  }'

Expected: ✅ Format validation rejects (no SQL injection possible)
```

#### XSS Test
```bash
# Try inject script in device name
{
  "deviceName": "<script>alert('xss')</script>"
}

Expected: ✅ Sanitized before display in admin dashboard
```

#### Rate Limiting Test
```bash
# Send 100 requests in 1 second
for i in {1..100}; do
  curl -X POST https://your-url.vercel.app/api/activate ... &
done

Expected: ✅ Vercel rate limiting kicks in (some requests fail with 429)
```

---

### 10. Mobile-Specific Tests

#### Android Tests
```bash
✅ Activation works on Android 10+
✅ Device ID generation works (expo-device)
✅ SecureStore encryption works
✅ Offline mode after activation works
✅ App survives phone restart (license persists)
✅ Uninstall → Reinstall requires re-activation
```

#### iOS Tests (Optional)
```bash
✅ Activation works on iOS 13+
✅ Device ID generation works
✅ Keychain storage works (SecureStore)
✅ Offline mode works
```

---

## 🎯 Production Readiness Checklist

Before going live:

- [ ] All test cases above passed (✅)
- [ ] API URL updated in app (production Vercel URL)
- [ ] Environment variables secured (no .env in Git)
- [ ] Supabase RLS policies verified (security)
- [ ] Admin dashboard accessible (https://...)
- [ ] Test license generated & activated successfully
- [ ] Device reset tested
- [ ] Revoke license tested
- [ ] Error messages user-friendly (Indonesian)
- [ ] Backup strategy prepared (weekly CSV export)
- [ ] Customer support process documented
- [ ] APK built & ready to distribute
- [ ] **🚀 Ready to launch!**

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**: Check Supabase credentials di Vercel env variables

### Issue: API returns 404
**Solution**: Check API route path: `app/api/activate/route.ts`

### Issue: License not found (but exists in dashboard)
**Solution**: Check case sensitivity (license key harus UPPERCASE)

### Issue: Device reset not working
**Solution**: Check RLS policies (anon user needs UPDATE permission)

### Issue: App crash after activation
**Solution**: Check SecureStore permissions (might need rebuild)

---

## 📊 Monitoring Post-Launch

### Daily Checks (First Week)
- Check activation success rate (admin dashboard)
- Monitor activation logs (Supabase → activation_logs table)
- Check Vercel bandwidth usage
- Check Supabase database size

### Weekly Checks
- Export license backup (CSV)
- Review revoked licenses (any abuse?)
- Check customer support tickets (any reset requests?)
- Monitor Vercel/Supabase limits (approaching?)

### Monthly Checks
- Review pricing (still FREE tier?)
- Update documentation (any changes?)
- Plan for scaling (if needed)

---

**Testing Complete!** ✅  
**Ready for Production** 🚀
