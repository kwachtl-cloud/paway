# 🚀 Paway - Instrukcja Budowania Android APK

## Przygotowanie do pierwszego buildu

### 1️⃣ Wdrożenie reguł Firestore (WAŻNE!)

Przed budowaniem aplikacji produkcyjnej **musisz** wdrożyć reguły bezpieczeństwa do Firebase.

#### Instalacja Firebase CLI (jeśli jeszcze nie masz):
```bash
npm install -g firebase-tools
```

#### Logowanie do Firebase:
```bash
firebase login
```

#### Inicjalizacja projektu (jednorazowo):
```bash
firebase init firestore
# Wybierz swój projekt Firebase
# Użyj domyślnych ścieżek: firestore.rules i firestore.indexes.json
```

#### Deploy reguł i indeksów:
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

> ⚠️ **WAŻNE**: Bez tego kroku Firestore będzie otwarty dla wszystkich lub zablokowany!

---

## 2️⃣ Build i Synchronizacja z Capacitor

### Krok 1: Zbuduj wersję produkcyjną
```bash
npm run build
```

To utworzy folder `dist/` z zoptymalizowaną aplikacją.

### Krok 2: Zsynchronizuj z Capacitor Android
```bash
npx cap sync android
```

To skopiuje pliki z `dist/` do `android/app/src/main/assets/public/`.

---

## 3️⃣ Generowanie APK

### Metoda A: Przez Android Studio (zalecane)

1. **Otwórz projekt Android:**
```bash
npx cap open android
```

2. **W Android Studio:**
   - Poczekaj aż Gradle skończy synchronizację
   - `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
   - APK znajdziesz w: `android/app/build/outputs/apk/debug/app-debug.apk`

3. **Testowanie na urządzeniu:**
   - Podłącz telefon przez USB
   - Włącz "Tryb programisty" i "Debugowanie USB"
   - `Run` → `Run 'app'` w Android Studio

### Metoda B: Przez terminal (szybsza)

```bash
cd android
./gradlew assembleDebug
```

APK znajdziesz w: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4️⃣ Instalacja APK na telefonie

### Przez ADB (Android Debug Bridge):
```bash
# Sprawdź czy urządzenie jest podłączone
adb devices

# Zainstaluj APK
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Przez plik:
1. Skopiuj `app-debug.apk` na telefon
2. Otwórz plik i zainstaluj
3. Może być konieczne włączenie "Instalacji z nieznanych źródeł"

---

## 5️⃣ Wersja Release (produkcyjna)

### Generowanie klucza podpisującego:
```bash
cd android
keytool -genkey -v -keystore paway-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias paway
```

### Konfiguracja podpisywania:

Edytuj `android/app/build.gradle` i dodaj:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../paway-release-key.jks')
            storePassword 'twoje-haslo'
            keyAlias 'paway'
            keyPassword 'twoje-haslo'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Build Release APK:
```bash
cd android
./gradlew assembleRelease
```

APK znajdziesz w: `android/app/build/outputs/apk/release/app-release.apk`

---

## 6️⃣ Checklist przed buildem

- [ ] `.env` zawiera poprawne dane Firebase
- [ ] Firestore rules wdrożone: `firebase deploy --only firestore:rules`
- [ ] Firestore indexes wdrożone: `firebase deploy --only firestore:indexes`
- [ ] Google Maps API key dodany w `.env` (`VITE_GOOGLE_MAPS_API_KEY`)
- [ ] `npm run build` działa bez błędów
- [ ] `npx cap sync android` wykonane
- [ ] Wersja w `package.json` zaktualizowana
- [ ] Permissions w `android/app/src/main/AndroidManifest.xml` sprawdzone

---

## 7️⃣ Szybki Skrypt (całość w jednym poleceniu)

Użyj skryptu `build-apk.ps1` (lub `.sh` na macOS/Linux):

```bash
# Windows PowerShell
.\build-apk.ps1

# macOS/Linux
chmod +x build-apk.sh
./build-apk.sh
```

---

## 🔧 Troubleshooting

### "Build failed" - Gradle
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

### "Could not find com.android..."
- Otwórz Android Studio
- `File` → `Sync Project with Gradle Files`

### Aplikacja nie działa na telefonie
- Sprawdź logi: `adb logcat | grep Capacitor`
- Sprawdź czy `.env` ma `VITE_FIREBASE_*` ustawione
- Sprawdź czy Firebase ma włączone Auth i Firestore

### Google Maps nie wyświetla się
- Sprawdź czy `VITE_GOOGLE_MAPS_API_KEY` jest w `.env`
- Upewnij się że API key ma włączone "Maps SDK for Android"
- Sprawdź czy billing jest aktywny w Google Cloud Console

---

## 📱 Wymagania

- **Node.js**: 16.x lub wyższy
- **Java JDK**: 17 (zalecane)
- **Android Studio**: Arctic Fox lub nowszy
- **Gradle**: 8.x (instalowany automatycznie)

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Deploy Firebase
firebase deploy --only firestore:rules,firestore:indexes

# 2. Build i sync
npm run build
npx cap sync android

# 3. Wygeneruj APK
cd android && ./gradlew assembleDebug

# 4. Zainstaluj
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 📝 Następne kroki po pierwszym APK

1. Testowanie na prawdziwym urządzeniu Android
2. Zebranie feedbacku od użytkowników
3. Optymalizacja wydajności (lazy loading, code splitting)
4. Dodanie ikon i splash screen (Capacitor Assets)
5. Publikacja w Google Play Store (wymaga Release APK)

---

**Powodzenia! 🐾**
