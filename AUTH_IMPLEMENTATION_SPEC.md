# 🔐 PAWAY - FULL AUTH FLOW & MULTI-USER SYSTEM
## Technical Specification & Implementation Plan

**Created:** 2026-07-22  
**Target:** Tomorrow morning batch implementation  
**Estimated Time:** 2-3 hours  
**Status:** READY FOR IMPLEMENTATION

---

## 📋 OVERVIEW

### Current State (Before)
- ❌ No proper auth flow - users can't register/login
- ❌ No user isolation - all data is shared
- ❌ Pet Passport accessible without login
- ❌ No user profiles in Firestore
- ❌ SOS Alerts not tied to user accounts
- ✅ Firebase Auth partially configured
- ✅ AppContext exists but minimal user state

### Target State (After)
- ✅ Full authentication flow (Email/Password + Google Sign-In)
- ✅ User registration with profile creation
- ✅ Firestore `users/{uid}` collection with user data
- ✅ Protected routes - redirect to login if not authenticated
- ✅ Data isolation - each user sees only their data
- ✅ Pet Passport per user (multi-pet support)
- ✅ SOS Alerts with user ownership
- ✅ User profiles with name, email, avatar
- ✅ Park Radar with user filtering
- ✅ Messages between users

---

## 🏗️ ARCHITECTURE

### 1. Authentication System

#### Firebase Auth Methods
```javascript
// Supported auth methods:
1. Email/Password (primary)
2. Google Sign-In (secondary - nice to have)
```

#### Auth Context Structure
```javascript
// src/context/AuthContext.jsx (NEW FILE)
{
  user: {
    uid: string,           // Firebase UID
    email: string,
    name: string,
    photoURL: string,
    createdAt: timestamp
  },
  loading: boolean,        // Auth state loading
  login: (email, password) => Promise,
  register: (email, password, name) => Promise,
  loginWithGoogle: () => Promise,
  logout: () => Promise,
  updateUserProfile: (data) => Promise
}
```

### 2. Firestore Data Structure

#### Users Collection
```
/users/{uid}
  - uid: string (same as auth UID)
  - email: string
  - name: string
  - photoURL: string (optional)
  - fcmToken: string (push notifications)
  - lastLocation: {
      lat: number,
      lng: number,
      geohash: string
    }
  - createdAt: timestamp
  - updatedAt: timestamp
  - settings: {
      language: string,
      notifications: boolean
    }
```

#### Pets Collection (Updated)
```
/users/{uid}/pets/{petId}
  - id: string
  - name: string
  - species: string (dog/cat/other)
  - breed: string
  - age: number
  - photos: string[]
  - owner: {
      uid: string,
      name: string,
      email: string
    }
  - createdAt: timestamp
  - updatedAt: timestamp
```

#### SOS Alerts (Updated)
```
/sos_alerts/{alertId}
  - userId: string (owner UID)
  - userName: string
  - userEmail: string
  - petId: string
  - petName: string
  - petPhoto: string
  - location: { lat, lng, geohash }
  - description: string
  - contactPhone: string
  - status: 'active' | 'resolved'
  - createdAt: timestamp
  - notificationsSent: number
  - notificationsFailed: number
```

#### Conversations (Already exists - just verify)
```
/conversations/{conversationId}
  - participants: [uid1, uid2]
  - participantDetails: {
      uid1: { name, email, photoURL },
      uid2: { name, email, photoURL }
    }
  - lastMessage: { text, senderId, timestamp }
  - unreadCount: { uid1: 0, uid2: 0 }
  - createdAt: timestamp
  - updatedAt: timestamp
```

### 3. Route Protection

#### Public Routes (No Auth Required)
- `/welcome` - Welcome/Onboarding screen
- `/login` - Login screen
- `/register` - Registration screen

#### Protected Routes (Auth Required)
- `/home` - Home screen
- `/pet-passport` - Pet management
- `/park-radar` - Nearby pets/parks
- `/sos` - SOS alert creation
- `/messages` - Messaging
- `/profile` - User profile
- `/bookings` - Service bookings
- All other screens

#### Implementation
```javascript
// src/components/ProtectedRoute.jsx (NEW FILE)
- Check if user is authenticated
- If not: redirect to /login
- If yes: render children
- Show loading state while checking auth
```

### 4. Screen Flow

#### First Time User Flow
```
1. App loads → WelcomeScreen
2. User taps "Get Started" → RegisterScreen
3. User fills form (email, password, name)
4. Registration creates:
   - Firebase Auth user
   - Firestore /users/{uid} document
   - FCM token saved
5. Redirect → HomeScreen (authenticated)
```

#### Returning User Flow
```
1. App loads → Check auth state
2. If authenticated → HomeScreen
3. If not authenticated → LoginScreen
4. User logs in
5. Update FCM token
6. Update lastLocation
7. Redirect → HomeScreen
```

#### Logout Flow
```
1. User taps logout in ProfileScreen
2. Sign out from Firebase Auth
3. Clear local state
4. Remove FCM token from Firestore
5. Redirect → WelcomeScreen
```

---

## 📂 FILE CHANGES

### NEW FILES TO CREATE

1. **src/screens/WelcomeScreen.jsx**
   - Beautiful onboarding screen
   - "Get Started" → RegisterScreen
   - "Already have account" → LoginScreen
   - App logo, tagline, features overview

2. **src/screens/LoginScreen.jsx**
   - Email + Password inputs
   - "Login" button
   - "Forgot Password?" link
   - "Sign in with Google" button (optional)
   - "Don't have account? Register" link
   - Error handling
   - Loading states

3. **src/screens/RegisterScreen.jsx**
   - Name input
   - Email input
   - Password input (with strength indicator)
   - Confirm Password input
   - "Create Account" button
   - "Already have account? Login" link
   - Terms & Privacy checkbox
   - Error handling
   - Auto-creates Firestore user document

4. **src/components/ProtectedRoute.jsx**
   - Wrapper component for protected routes
   - Checks auth state
   - Redirects to login if not authenticated
   - Shows loading spinner while checking

5. **src/context/AuthContext.jsx** (or enhance AppContext)
   - Full auth state management
   - Login/Register/Logout functions
   - User profile management
   - Firebase Auth integration

### FILES TO MODIFY

1. **src/context/AppContext.jsx**
   - Enhance user state management
   - Add auth state listeners
   - Add user profile from Firestore
   - Keep FCM token logic

2. **src/firebase/services.js**
   - Add `createUserProfile(uid, data)`
   - Add `getUserProfile(uid)`
   - Add `updateUserProfile(uid, data)`
   - Update `getPets()` to filter by user UID
   - Update `addPet()` to save under /users/{uid}/pets
   - Update `sendSOSAlert()` to include user email
   - Add `deleteAccount(uid)` for user deletion

3. **src/screens/HomeScreen.jsx**
   - Add user greeting with name
   - Show user avatar
   - Add "No pets" state with CTA to add pet
   - Ensure data loads only for authenticated user

4. **src/screens/PetPassportScreen.jsx**
   - Load only user's pets
   - Add "Add Your First Pet" empty state
   - Show user ownership clearly

5. **src/screens/ProfileScreen.jsx**
   - Add "Logout" button
   - Show user profile (name, email, avatar)
   - Add "Edit Profile" functionality
   - Add "Delete Account" (with confirmation)
   - Settings section

6. **src/screens/SOSScreen.jsx**
   - Auto-fill user info from profile
   - Load only user's pets
   - Save userId, userName, userEmail

7. **src/App.jsx** (or main.jsx)
   - Add route protection
   - Add welcome/login/register routes
   - Redirect logic based on auth state

8. **src/screens/BookingsScreen.jsx**
   - Filter bookings by user UID
   - Show only user's bookings

9. **src/screens/ParkRadarScreen.jsx**
   - Show all public parks
   - Show nearby pets (optional privacy setting)

---

## 🔒 SECURITY RULES

### Firestore Security Rules (firebase.json)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // User can read their own data
      allow read: if request.auth != null && request.auth.uid == userId;
      // User can write their own data
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // User's pets subcollection
    match /users/{userId}/pets/{petId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // SOS Alerts - read by anyone, write by authenticated users
    match /sos_alerts/{alertId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update: if request.auth != null && (
        request.auth.uid == resource.data.userId ||  // Owner can update
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['viewedBy', 'reportedSightings'])  // Anyone can add sightings
      );
      allow delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    
    // Conversations - only participants can access
    match /conversations/{conversationId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
      
      match /messages/{messageId} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.participants;
      }
    }
    
    // Bookings - user can see their own
    match /bookings/{bookingId} {
      allow read: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
      allow update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🎨 UI/UX DESIGN

### WelcomeScreen Design
```
+---------------------------+
|         [LOGO]            |
|                           |
|    Welcome to Paway!      |
|   Your pet's companion    |
|                           |
|   [Illustration/Image]    |
|                           |
|  • Track your pet         |
|  • Find lost pets         |
|  • Connect with owners    |
|                           |
|   [Get Started Button]    |
|   [Already member? Login] |
+---------------------------+
```

### LoginScreen Design
```
+---------------------------+
|        [← Back]           |
|                           |
|      Welcome Back!        |
|                           |
|  Email                    |
|  [___________________]    |
|                           |
|  Password                 |
|  [___________________]    |
|  [Forgot Password?]       |
|                           |
|    [Login Button]         |
|                           |
|  ─────── OR ──────────    |
|                           |
|  [Sign in with Google]    |
|                           |
|  Don't have account?      |
|  [Register]               |
+---------------------------+
```

### RegisterScreen Design
```
+---------------------------+
|        [← Back]           |
|                           |
|     Create Account        |
|                           |
|  Full Name                |
|  [___________________]    |
|                           |
|  Email                    |
|  [___________________]    |
|                           |
|  Password                 |
|  [___________________]    |
|  ● Strength: [====--]     |
|                           |
|  Confirm Password         |
|  [___________________]    |
|                           |
|  □ I agree to Terms       |
|                           |
|  [Create Account]         |
|                           |
|  Already have account?    |
|  [Login]                  |
+---------------------------+
```

---

## 🧪 TESTING CHECKLIST

### Registration Flow
- [ ] Can create account with email/password
- [ ] Password validation works (min 6 chars)
- [ ] Email validation works
- [ ] Name is required
- [ ] Duplicate email shows error
- [ ] User document created in Firestore
- [ ] FCM token saved
- [ ] Redirects to home after registration

### Login Flow
- [ ] Can login with existing credentials
- [ ] Wrong password shows error
- [ ] Non-existent email shows error
- [ ] FCM token updated on login
- [ ] Location updated on login
- [ ] Redirects to home after login
- [ ] "Remember me" persists session

### Protected Routes
- [ ] Unauthenticated user redirected to login
- [ ] Authenticated user can access all screens
- [ ] Deep links work after authentication
- [ ] Back button doesn't bypass auth

### Data Isolation
- [ ] User A can't see User B's pets
- [ ] User A can't edit User B's data
- [ ] SOS alerts show correct owner
- [ ] Messages only between participants
- [ ] Bookings filtered by user

### Logout Flow
- [ ] Logout clears user state
- [ ] Redirects to welcome screen
- [ ] Can't access protected routes after logout
- [ ] Can login again with same credentials

### Google Sign-In (if implemented)
- [ ] Opens Google consent screen
- [ ] Creates user document on first login
- [ ] Returns to app after consent
- [ ] Handles cancellation gracefully

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Implementation
- [x] Spec created
- [x] Checklist created
- [ ] Firebase Auth enabled (Email/Password + Google)
- [ ] Firestore security rules updated
- [ ] Test accounts created

### After Implementation
- [ ] All tests passed
- [ ] No console errors
- [ ] Build succeeds
- [ ] APK generated
- [ ] Tested on 2 devices
- [ ] Firestore rules deployed
- [ ] Committed to Git
- [ ] GitHub Actions build passed

---

## 📝 NOTES

### Existing Code to Preserve
- ✅ SOS Alert system with push notifications
- ✅ Messaging system
- ✅ Pet management basics
- ✅ Geolocation utilities
- ✅ FCM token management
- ✅ Cloud Functions for notifications

### Migration Strategy
- Current localStorage pets → move to Firestore /users/{uid}/pets
- Add userId field to existing SOS alerts (manual or migration script)
- Existing conversations already have participants array

### Performance Considerations
- Use Firestore indexes for common queries
- Cache user profile in memory
- Lazy load pet photos
- Paginate lists (pets, alerts, messages)

### Edge Cases to Handle
- User deletes account → cascade delete pets, alerts
- User changes email → update all references
- Multiple devices → FCM token array
- Offline mode → queue writes, sync on reconnect

---

## 🎯 SUCCESS CRITERIA

✅ **DONE WHEN:**
1. User can register with email/password
2. User can login with credentials
3. User profile stored in Firestore
4. Routes protected - redirect to login
5. Pets scoped to user UID
6. SOS Alerts show user ownership
7. Messages work between users
8. Profile screen with logout
9. Clean UI/UX for auth screens
10. No security vulnerabilities
11. APK builds successfully
12. Tested on 2 real devices

---

**READY FOR IMPLEMENTATION TOMORROW MORNING! 🚀**
