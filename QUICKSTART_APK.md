# 🚀 Quick Start - Pierwsze APK w 5 minut

## Prerequisites (jednorazowo)

1. **Zainstaluj Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Zaloguj się do Firebase:**
   ```bash
   firebase login
   ```

3. **Zainicjuj projekt** (tylko przy pierwszym razie):
   ```bash
   firebase init firestore
   # Wybierz swój projekt Firebase
   # Użyj domyślnych plików: firestore.rules i firestore.indexes.json
   ```

---

## 🔥 Krok 1: Deploy Firestore Rules (< 1 min)

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

✅ To zabezpieczy Twoją bazę danych przed nieautoryzowanym dostępem.

---

## 🏗️ Krok 2: Build & Sync (< 2 min)

### Opcja A: Automatyczny skrypt (ZALECANE)

**Windows PowerShell:**
```powershell
.\build-apk.ps1
```

**macOS/Linux:**
```bash
chmod +x build-apk.sh
./build-apk.sh
```

Skrypt zapyta o:
1. Czy zdeployować Firebase rules? → `y` (jeśli nie zrobiłeś w Kroku 1)
2. Metodę budowania APK → `2` dla Gradle CLI (szybsze)
3. Czy zainstalować na telefonie? → `y` (jeśli masz podłączony telefon)

---

### Opcja B: Manualnie

```bash
# 1. Build
npm run build

# 2. Sync z Capacitor
npx cap sync android

# 3. Gradle build
cd android
./gradlew assembleDebug  # Windows: .\gradlew.bat assembleDebug

# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 📱 Krok 3: Zainstaluj APK na telefonie

### Metoda A: Przez USB (ADB)

1. **Włącz tryb programisty na telefonie:**
   - Ustawienia → O telefonie → Kliknij 7x w "Numer kompilacji"
   - Wróć do Ustawień → Opcje programisty → Włącz "Debugowanie USB"

2. **Podłącz telefon przez USB**

3. **Zainstaluj APK:**
   ```bash
   adb devices  # Sprawdź czy telefon widoczny
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

### Metoda B: Przez plik

1. Skopiuj `android/app/build/outputs/apk/debug/app-debug.apk` na telefon
2. Otwórz plik i kliknij "Zainstaluj"
3. Jeśli trzeba, włącz "Instalacja z nieznanych źródeł"

---

## 🔧 Krok 4: Konfiguracja przed pierwszym uruchomieniem

### Google Maps API Key dla Androida

**WAŻNE**: Google Maps na Androidzie wymaga OSOBNEGO klucza API!

1. Przejdź do: https://console.cloud.google.com/apis/credentials
2. `Create Credentials` → `API Key`
3. Restrykcje:
   - **Application restrictions**: Android apps
   - **Package name**: `com.paway.app` (sprawdź w `capacitor.config.json`)
   - **SHA-1**: Uzyskaj przez:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
4. **API restrictions**: Włącz "Maps SDK for Android"

5. **Dodaj klucz do AndroidManifest.xml:**

Otwórz: `android/app/src/main/AndroidManifest.xml`

Znajdź tag `<application>` i dodaj wewnątrz:

```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="TWOJ_ANDROID_MAPS_API_KEY"/>
```

6. **Przebuduj APK:**
```bash
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## 🎉 Gotowe! Uruchom aplikację

1. Znajdź ikonę "Paway" na telefonie
2. Przy pierwszym uruchomieniu aplikacja poprosi o:
   - ✓ Dostęp do lokalizacji (dla Park Radar i SOS)
   - ✓ Dostęp do aparatu (dla Pet Passport)
3. Przetestuj funkcje MVP:
   - 🐾 **Pet Passport**: Dodaj profil swojego pupila ze zdjęciem
   - 🚨 **SOS Alerts**: Wyślij testowy alert o zgubionym zwierzaku
   - 🗺️ **Park Radar**: Zobacz miejsca pet-friendly we Wrocławiu

---

## 📋 Troubleshooting

### Problem: "Build failed"
```bash
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace
```

### Problem: "Google Maps nie wyświetla się"
- Sprawdź czy dodałeś Android Maps API Key do `AndroidManifest.xml`
- Sprawdź czy API key ma włączone "Maps SDK for Android"
- Sprawdź logi: `adb logcat | grep Maps`

### Problem: "App crashes on startup"
- Sprawdź czy `.env` ma wszystkie zmienne `VITE_FIREBASE_*`
- Sprawdź logi: `adb logcat | grep Capacitor`
- Sprawdź czy Firebase rules są wdrożone

### Problem: "Nie mogę uzyskać lokalizacji"
- Sprawdź czy w AndroidManifest.xml są uprawnienia `ACCESS_FINE_LOCATION` i `ACCESS_COARSE_LOCATION`
- Sprawdź w ustawieniach telefonu czy Paway ma dostęp do lokalizacji

Więcej szczegółów: `ANDROID_PERMISSIONS.md`

---

## 📚 Dalsze zasoby

- **Pełny przewodnik**: `BUILD_APK_GUIDE.md`
- **Uprawnienia Android**: `ANDROID_PERMISSIONS.md`
- **Capacitor Docs**: https://capacitorjs.com/docs/android
- **Firebase Docs**: https://firebase.google.com/docs

---

**Powodzenia z pierwszym buildem! 🐾**

Masz problemy? Sprawdź logi:
```bash
adb logcat | grep -E "Capacitor|Firebase|GoogleMap"
```
