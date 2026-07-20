# 📦 PAWAY MVP - Instalacja Zależności

## Brakujące biblioteki do zainstalowania:

```bash
# Geolokalizacja i Geohashing (dla SOS w promieniu)
npm install geofire-common

# Generowanie QR Code (dla Pet Passport)
npm install qrcode
npm install --save-dev @types/qrcode

# UUID generator (dla unique IDs)
npm install uuid
```

## Opcjonalne (dla przyszłych funkcji):
```bash
# Push Notifications (Capacitor)
npm install @capacitor/push-notifications

# Capacitor Geolocation
npm install @capacitor/geolocation

# Camera (dla zdjęć zwierząt)
npm install @capacitor/camera
```

## Sprawdzenie obecnych zależności:
```bash
npm list firebase
npm list @react-google-maps/api
npm list lucide-react
```

## Uruchomienie projektu:
```bash
# 1. Zainstaluj zależności
npm install

# 2. Skopiuj i skonfiguruj .env
cp .env.example .env
# Następnie edytuj .env i dodaj swoje klucze Firebase

# 3. Uruchom dev server
npm run dev

# 4. Build dla Androida
npm run build
npx cap sync android
npx cap open android
```

## Konfiguracja Firebase w konsoli:
1. Przejdź do https://console.firebase.google.com
2. Utwórz nowy projekt lub wybierz istniejący "paway"
3. W Project Settings → General → Your apps, skopiuj konfigurację
4. Wklej klucze do pliku `.env`
5. W Firestore Database → Rules, skopiuj zawartość `firestore.rules`
6. W Firestore Database → Indexes, zaimportuj `firestore.indexes.json`

## Konfiguracja Google Maps:
1. Przejdź do https://console.cloud.google.com/google/maps-apis
2. Włącz Maps JavaScript API
3. Utwórz klucz API z ograniczeniami dla domeny
4. Dodaj klucz do `.env` jako `VITE_GOOGLE_MAPS_API_KEY`
