# 🔐 Android Permissions dla Paway

## Wymagane uprawnienia w AndroidManifest.xml

Aplikacja Paway wymaga następujących uprawnień do pełnej funkcjonalności:

### ✅ Już skonfigurowane (przez Capacitor)

```xml
<!-- Internet (Firebase, Google Maps) -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 🌍 Uprawnienia do geolokalizacji

Dla funkcji **SOS Alerts** i **Park Radar** potrzebujemy lokalizacji:

### Do dodania w `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Geolocation permissions -->
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" android:required="false" />
```

### Dodaj przed tagiem `<application>`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- Existing permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    
    <!-- ADD THESE: -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    
    <application ...>
        ...
    </application>
</manifest>
```

---

## 📸 Uprawnienia do aparatu i galerii

Dla funkcji **Pet Passport** (zdjęcia pupila):

### Capacitor automatycznie dodaje te uprawnienia gdy używasz:
- `@capacitor/camera`

Upewnij się że masz w `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Camera and Storage -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

---

## 🗺️ Google Maps API Key (Android)

Google Maps wymaga API key również w Android (nie tylko w .env):

### Krok 1: Utwórz Android API Key w Google Cloud Console

1. Przejdź do: https://console.cloud.google.com/apis/credentials
2. `Create Credentials` → `API Key`
3. `Restrict key`:
   - Application restrictions: **Android apps**
   - Add your package name: `com.paway.app` (lub Twój)
   - Add SHA-1 certificate fingerprint:
     ```bash
     # Debug certificate
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
4. API restrictions: Enable **Maps SDK for Android**

### Krok 2: Dodaj klucz do AndroidManifest.xml

W `android/app/src/main/AndroidManifest.xml`, wewnątrz tagu `<application>`:

```xml
<application ...>
    
    <!-- ADD THIS: -->
    <meta-data
        android:name="com.google.android.geo.API_KEY"
        android:value="TWOJ_ANDROID_MAPS_API_KEY"/>
    
    <!-- Existing activities -->
    <activity ...>
        ...
    </activity>
    
</application>
```

> ⚠️ **WAŻNE**: To jest INNY klucz niż ten w `.env`! Android wymaga osobnego klucza z restrykcjami na poziomie aplikacji Android.

---

## 🔔 Uprawnienia do notyfikacji (Push) - Opcjonalne

Dla przyszłej funkcji **Cloud Functions** (powiadomienia o SOS):

```xml
<!-- Firebase Cloud Messaging -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

W `<application>`:

```xml
<service
    android:name=".MyFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

---

## 📋 Kompletny przykład AndroidManifest.xml

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.paway.app">

    <!-- Network -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Geolocation (SOS + Park Radar) -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-feature android:name="android.hardware.location.gps" android:required="false" />
    
    <!-- Camera and Storage (Pet Photos) -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-feature android:name="android.hardware.camera" android:required="false" />
    
    <!-- Notifications (Optional - future feature) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <!-- Google Maps API Key -->
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_ANDROID_MAPS_API_KEY"/>

        <!-- Main Activity -->
        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>
</manifest>
```

---

## ✅ Checklist przed buildem APK

- [ ] `ACCESS_COARSE_LOCATION` i `ACCESS_FINE_LOCATION` dodane
- [ ] Google Maps Android API Key utworzony w Google Cloud
- [ ] API Key ma restrykcje: "Android apps" + package name + SHA-1
- [ ] API Key dodany do `<meta-data>` w AndroidManifest.xml
- [ ] `CAMERA` i `READ_EXTERNAL_STORAGE` permissions obecne
- [ ] Package name w `AndroidManifest.xml` zgadza się z Capacitor config

---

## 🧪 Testowanie uprawnień

Po zainstalowaniu APK na telefonie:

1. **Geolokalizacja**: Otwórz Park Radar - poprosi o pozwolenie
2. **Aparat**: W Pet Passport dodaj zdjęcie - poprosi o pozwolenie
3. **Google Maps**: Sprawdź czy mapa się wyświetla w Park Radar

### Sprawdzanie uprawnień w ustawieniach telefonu:
`Ustawienia → Aplikacje → Paway → Uprawnienia`

Powinny być:
- ✓ Lokalizacja
- ✓ Aparat
- ✓ Zdjęcia i multimedia

---

## 🔧 Troubleshooting

### "Google Maps nie wyświetla się"
1. Sprawdź czy API Key jest poprawny
2. Sprawdź czy billing jest włączony w Google Cloud
3. Sprawdź czy "Maps SDK for Android" jest włączony
4. Sprawdź logi: `adb logcat | grep Maps`

### "Nie mogę uzyskać lokalizacji"
1. Sprawdź czy uprawnienia są w AndroidManifest.xml
2. Sprawdź w ustawieniach telefonu czy Paway ma dostęp do lokalizacji
3. Sprawdź logi: `adb logcat | grep Location`

### "Nie mogę dodać zdjęcia"
1. Sprawdź czy `@capacitor/camera` jest zainstalowany: `npm list @capacitor/camera`
2. Sprawdź uprawnienia CAMERA i READ_EXTERNAL_STORAGE
3. Sprawdź czy FileProvider jest w AndroidManifest.xml

---

**Powodzenia! 🐾**
