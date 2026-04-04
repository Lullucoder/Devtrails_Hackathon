# RoziRakshak AI - Onboarding Integration Complete ✅

## Overview

I've successfully connected the entire authentication and onboarding flow from Firebase Auth → Worker Onboarding → Worker Dashboard → Admin Portal. Everything now works end-to-end with real-time data synchronization.

---

## What Was Implemented

### 1. Firebase Authentication Flow ✅

**Location:** `src/contexts/AuthContext.tsx`, `src/components/LoginModal.tsx`

- Phone/OTP authentication via Firebase Auth
- Role selection (Worker/Admin) during signup
- Automatic user document creation in Firestore `workers` collection
- Session persistence and auto-login on page reload

**Key Changes:**
- Workers are created with `isOnboarded: false` initially
- Admins skip onboarding (`isOnboarded: true`)
- User profile is fetched from Firestore after authentication

---

### 2. Onboarding Flow ✅

**Location:** `src/app/onboarding/page.tsx`

**4-Step Process:**
1. **Aadhaar Verification** (DigiLocker mock) - Optional but recommended
2. **Personal Details** - Name, City, Platform
3. **Work Details** - Zone, Shift, Earnings, UPI ID
4. **Face Liveness Check** - MediaPipe-powered verification with R2 storage

**Key Changes:**
- Now uses the authenticated user's UID (`user.uid`) instead of generating a new one
- Updates the existing Firestore document instead of creating a new one
- Sets `isOnboarded: true` upon completion
- Redirects to `/worker/dashboard` after successful onboarding
- All KYC data (Aadhaar, Face) is properly stored

---

### 3. Smart Routing ✅

**Location:** `src/app/page.tsx`

**Routing Logic:**
```
User logs in
  ↓
Is Admin? → Yes → /admin/dashboard
  ↓ No
Is Onboarded? → Yes → /worker/dashboard
  ↓ No
→ /onboarding
```

This ensures:
- New workers are forced to complete onboarding
- Returning workers go straight to their dashboard
- Admins bypass onboarding entirely

---

### 4. Real-Time Admin Portal ✅

**Location:** `src/app/admin/users/page.tsx`

**Features:**
- Real-time Firestore listener using `onSnapshot`
- Displays all registered workers with live updates
- Shows KYC status (Aadhaar verified/unverified)
- Shows Face verification status (clickable to view photo)
- Filter by KYC status (All / Verified / Unverified)
- Search by name, city, or phone
- Displays: Platform, Plan, Claims, Trust Score, Phone, Join Date

**Key Changes:**
- Removed mock data
- Added Firestore real-time listener
- Proper date formatting for Firestore timestamps
- Loading state while fetching data
- Empty state when no workers exist

---

## Data Flow

```
1. User signs up via LoginModal
   ↓
2. Firebase Auth creates user
   ↓
3. AuthContext creates Firestore document in `workers` collection
   {
     uid: "firebase-uid",
     phone: "+919876543210",
     name: "",
     city: "",
     platform: "",
     zone: "",
     workingHours: "",
     weeklyEarningRange: "",
     upiId: "",
     role: "worker",
     isOnboarded: false,  ← Key field
     trustScore: 0.8,
     activePlan: null,
     claimsCount: 0,
     joinedDate: serverTimestamp(),
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp()
   }
   ↓
4. User is redirected to /onboarding
   ↓
5. User completes 4-step onboarding
   ↓
6. Onboarding updates Firestore document
   {
     name: "Arjun Kumar",
     city: "Bengaluru",
     platform: "Zepto",
     zone: "Koramangala",
     workingHours: "full_day",
     weeklyEarningRange: "₹6,000–₹8,000",
     upiId: "arjun@upi",
     isOnboarded: true,  ← Updated
     trustScore: 0.85,  ← Higher if Aadhaar verified
     aadhaar_verified: true,
     aadhaar_masked: "XXXX-XXXX-3421",
     aadhaar_verified_at: serverTimestamp(),
     kyc_method: "digilocker_mock",
     face_verified: true,
     face_image_r2_key: "faces/{uid}.jpg",
     face_verified_at: serverTimestamp(),
     liveness_check_passed: true,
     updatedAt: serverTimestamp()
   }
   ↓
7. User is redirected to /worker/dashboard
   ↓
8. Admin sees worker in real-time on /admin/users
```

---

## Firestore Collections

### `workers` Collection

**Document ID:** Firebase Auth UID

**Fields:**
```typescript
{
  // Identity
  uid: string;
  phone: string;
  name: string;
  role: "worker" | "admin";
  
  // Work Details
  city: string;
  platform: string;
  zone: string;
  workingHours: string;
  weeklyEarningRange: string;
  upiId: string;
  
  // Status
  isOnboarded: boolean;  // ← Critical for routing
  trustScore: number;
  activePlan: "lite" | "core" | "peak" | null;
  claimsCount: number;
  
  // KYC - Aadhaar
  aadhaar_verified?: boolean;
  aadhaar_masked?: string;
  aadhaar_verified_at?: Timestamp;
  kyc_method?: "digilocker_mock";
  
  // KYC - Face
  face_verified?: boolean;
  face_image_r2_key?: string;
  face_verified_at?: Timestamp;
  liveness_check_passed?: boolean;
  
  // Timestamps
  joinedDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Testing the Flow

### 1. New Worker Signup

1. Go to landing page (`/`)
2. Click "Get Started"
3. Enter phone number (e.g., `9876543210`)
4. Select "Worker" role
5. Enter OTP `123456` (mock mode)
6. You'll be redirected to `/onboarding`
7. Complete all 4 steps:
   - Aadhaar: Enter 12 digits (e.g., `123456789012`)
   - Personal: Name, City, Platform
   - Work: Zone, Shift, Earnings, UPI
   - Face: Capture photo (mock mode auto-passes)
8. You'll be redirected to `/worker/dashboard`
9. Open `/admin/users` in another tab → See your worker appear in real-time!

### 2. Returning Worker Login

1. Sign out
2. Log in again with the same phone number
3. You'll be redirected directly to `/worker/dashboard` (skips onboarding)

### 3. Admin Login

1. Sign up with "Admin" role
2. You'll be redirected directly to `/admin/dashboard` (skips onboarding)

---

## Key Files Modified

### Authentication & Context
- ✅ `src/contexts/AuthContext.tsx` - Added `isOnboarded` tracking
- ✅ `src/components/LoginModal.tsx` - Proper redirect after login
- ✅ `src/app/page.tsx` - Smart routing based on role and onboarding status

### Onboarding
- ✅ `src/app/onboarding/page.tsx` - Uses authenticated UID, updates existing document
- ✅ `src/components/onboarding/AadhaarVerification.tsx` - Already implemented
- ✅ `src/components/onboarding/FaceVerificationStep.tsx` - Already implemented

### Admin Portal
- ✅ `src/app/admin/users/page.tsx` - Real-time Firestore data, KYC badges, search/filter

### Firestore Helpers
- ✅ `src/lib/firestore.ts` - Already has all CRUD functions

---

## Features Working

### ✅ Authentication
- Phone/OTP login
- Role selection
- Session persistence
- Auto-login on reload

### ✅ Onboarding
- 4-step wizard
- Aadhaar verification (DigiLocker mock)
- Face liveness check (MediaPipe)
- Data validation
- Progress indicator
- Back navigation

### ✅ Worker Dashboard
- Shows active cover
- Displays triggers monitored
- Recent claims
- Protected earnings
- Renewal reminders

### ✅ Admin Portal
- Real-time worker list
- KYC status badges
- Face photo viewer
- Search by name/city/phone
- Filter by KYC status
- Trust score visualization
- Join date display

---

## Environment Variables Required

Make sure these are set in `.env.local`:

```bash
# Firebase Client SDK (NEXT_PUBLIC_ prefix for browser access)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Mock Auth (optional, for testing without Firebase)
NEXT_PUBLIC_MOCK_AUTH=false

# Cloudflare R2 (for face photo storage)
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=rozirakshak-faces
```

---

## Next Steps (Optional Enhancements)

### 1. Worker Profile Page
- Allow workers to view/edit their profile
- Re-verify Aadhaar if needed
- Update UPI ID

### 2. Policy Purchase Flow
- Connect `/worker/policy` to premium engine
- Integrate Razorpay test mode
- Create policy documents in Firestore

### 3. Claims Flow
- Auto-create claims from trigger events
- Show claim status in worker dashboard
- Admin claim review interface

### 4. Admin Analytics
- Dashboard with charts
- Worker growth metrics
- KYC completion rate
- Claims statistics

### 5. Notifications
- Firebase Cloud Messaging (FCM)
- Push notifications for claims
- Renewal reminders
- Trigger alerts

---

## Troubleshooting

### Issue: "User not redirected after onboarding"
**Solution:** Check browser console for errors. Ensure Firestore rules allow writes to `workers` collection.

### Issue: "Admin portal shows no workers"
**Solution:** 
1. Check Firestore console - do documents exist in `workers` collection?
2. Check browser console for Firestore permission errors
3. Ensure Firestore rules allow reads for authenticated users

### Issue: "Face photo not displaying"
**Solution:** R2 credentials not configured. This is optional for prototype. The UI will show "Photo not available" gracefully.

### Issue: "Onboarding stuck on submitting"
**Solution:** Check browser console. Likely a Firestore write permission issue or missing environment variables.

---

## Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Workers collection
    match /workers/{workerId} {
      // Users can read their own document
      allow read: if request.auth != null && request.auth.uid == workerId;
      
      // Users can create their own document during signup
      allow create: if request.auth != null && request.auth.uid == workerId;
      
      // Users can update their own document
      allow update: if request.auth != null && request.auth.uid == workerId;
      
      // Admins can read all workers
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/workers/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections (policies, claims, etc.)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Summary

The entire authentication → onboarding → dashboard → admin portal flow is now fully connected and working with real-time Firestore data. Workers complete a 4-step onboarding process with KYC verification, and all data is immediately visible to admins. The system properly handles routing based on authentication status, role, and onboarding completion.

**Status:** ✅ Production-ready for prototype/demo
**Next:** Connect policy purchase and claims flows

---

**Built for DEVTrails 2026 Hackathon**  
**RoziRakshak AI - Income Protection for India's Gig Workforce**
