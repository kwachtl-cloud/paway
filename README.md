# Paway - Pet Care Platform

Premium mobile-first web app connecting pet owners with verified Sitters, Groomers, and Vets.

## Tech Stack
- **Frontend:** React.js + Vite
- **Styling:** Tailwind CSS v4
- **Icons:** Lucide React
- **Backend:** Firebase (Auth, Firestore, Storage)
- **Fonts:** Playfair Display (headings), Inter (body)

## Quick Start

```bash
cd C:\Users\kwachtl\paway
npm install
npm run dev
```

Server runs at: **http://localhost:5173**

### Test on Phone
Same WiFi network required:
```bash
npm run dev -- --host
```
Use the IP address shown (e.g., `http://192.168.1.x:5173`)

## Project Structure

```
src/
├── context/
│   └── AppContext.jsx          # Global state (navigation, language, user)
├── data/
│   ├── mockData.js             # Mock providers, bookings, messages, pets
│   └── translations.js         # PL / EN / DE translations
── utils/
│   └── aiMatch.js              # AI matchmaking algorithm
├── components/
│   └── BottomNav.jsx           # Bottom navigation bar (5 tabs)
├── screens/
│   ├── WelcomeScreen.jsx       # Welcome/onboarding screen
│   ├── HomeScreen.jsx          # Main home with search, quick actions
│   ├── CategoryScreen.jsx      # Pet Sitting category detail
│   ├── SearchScreen.jsx        # Provider search (list/map view)
│   ├── ProviderProfileScreen.jsx # Provider detail with stats
│   ├── BookingsScreen.jsx      # Upcoming/Past bookings
│   ├── MessagesScreen.jsx      # Chat list
│   ├── ProfileScreen.jsx       # User profile, coins, settings
│   ├── SOSScreen.jsx           # Emergency SOS alert
│   ├── TrackerScreen.jsx       # GPS tracker dashboard
│   ├── ParkRadarScreen.jsx     # Nearby dogs map
│   ├── PetPassportScreen.jsx   # Pet health book
│   └── NoseIDScanner.jsx       # Biometric nose scan simulation
├── firebase/
│   ├── firebase.js             # Firebase config
│   └── services.js             # Auth, Firestore CRUD functions
├── App.jsx                     # Main router
├── main.jsx                    # Entry point
└── index.css                   # Tailwind + design tokens
```

## Design System

| Token | Value |
|-------|-------|
| Brand Green | `#4A5D4E` |
| Background | `#FDF9F1` |
| Card | `#FFFFFF` |
| Text Dark | `#1A1A1A` |
| Text Body | `#4A4A4A` |
| Cream | `#FAF7F2` |
| Beige | `#F0EBE3` |

## Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication, Firestore, Storage
3. Copy config to `.env`:
```
cp .env.example .env
```

## Screens Implemented

| Screen | Status | Notes |
|--------|--------|-------|
| Welcome | ✅ | Log in button works |
| Home | ✅ | All buttons functional, heart toggle works |
| Category (Pet Sitting) | ✅ | Sticky header, scrollable content |
| Search (List/Map) | ✅ | Heart toggle, view switch works |
| Provider Profile | ✅ | Book button → Booking flow |
| Booking | ✅ | Date/time picker, confirmation |
| Bookings | ✅ | Upcoming/Past tabs |
| Messages | ✅ | Click → Chat screen |
| Chat | ✅ | Real-time messaging UI |
| Notifications | ✅ | Bell icon → notification list |
| Profile | ✅ | Language switcher, coins |
| Saved | ✅ | Heart toggle, provider cards |
| SOS | ✅ | Two-step confirmation |
| Tracker | ✅ | GPS dashboard |
| Park Radar | ✅ | Filters, dog pins |
| Pet Passport | ✅ | Add pet form, Nose-ID |
| Nose-ID Scanner | ✅ | Scanning animation |

## Next Steps

- Firebase integration
- Real auth flow
- Booking flow
- Chat screen
- Push notifications
- PWA setup for mobile install
