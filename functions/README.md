# Paway Firebase Cloud Functions

Firebase Cloud Functions dla aplikacji Paway - obsługa powiadomień push dla alertów SOS.

## 📋 Funkcje

### 1. `sendSOSNotifications`
**Wyzwalacz:** `onDocumentCreated` w kolekcji `sos_alerts/{alertId}`

**Działanie:**
1. Pobiera dane nowego alertu SOS (lokalizacja, nazwa zwierzaka, zdjęcie)
2. Wyszukuje użytkowników w promieniu **10 km** używając geohash queries
3. Zbiera tokeny FCM użytkowników w zasięgu
4. Wysyła powiadomienia push z:
   - Tytułem: "🚨 PILNE: Zaginął [typ zwierzaka] w Twojej okolicy!"
   - Opisem z odległością i danymi zwierzaka
   - Zdjęciem (jeśli dostępne)
   - Metadanymi alertu (ID, lokalizacja, telefon kontaktowy)
5. Aktualizuje dokument alertu ze statystykami wysyłki

**Payload powiadomienia:**
```javascript
{
  notification: {
    title: "🚨 PILNE: Zaginął pies w Twojej okolicy!",
    body: "Buddy zaginął 2.5km od Ciebie. Golden Retriever, 2 lata...",
    imageUrl: "https://..."
  },
  data: {
    alertId: "abc123",
    type: "sos_alert",
    petName: "Buddy",
    petType: "Dog",
    distance: "2.5",
    latitude: "52.2297",
    longitude: "21.0122",
    contactPhone: "+48123456789"
  }
}
```

### 2. `cleanupExpiredAlerts` (opcjonalna)
**Wyzwalacz:** Scheduler - codziennie o 00:00

**Działanie:**
- Usuwa rozwiązane alerty starsze niż 7 dni
- Pomaga w zarządzaniu rozmiarem bazy danych

## 🚀 Deployment

### Wymagania
- Firebase CLI: `npm install -g firebase-tools`
- Zalogowany do Firebase: `firebase login`
- Projekt ustawiony: `firebase use paway-d9573`

### Deploy wszystkich funkcji
```bash
firebase deploy --only functions
```

### Deploy konkretnej funkcji
```bash
firebase deploy --only functions:sendSOSNotifications
```

### Testowanie lokalne (emulator)
```bash
cd functions
npm run serve
```

## 📊 Monitoring

### Logi w czasie rzeczywistym
```bash
firebase functions:log --only sendSOSNotifications
```

### Wszystkie logi
```bash
firebase functions:log
```

### Metryki w konsoli Firebase
https://console.firebase.google.com/project/paway-d9573/functions

## 🔧 Konfiguracja

### Zmiana promienia powiadomień
W pliku `index.js` linia ~42:
```javascript
const radiusInKm = 10; // Zmień na inną wartość (w km)
```

### Zmiana czasu wygasania alertów
W funkcji `cleanupExpiredAlerts` linia ~238:
```javascript
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Zmień na inną liczbę dni
```

## ⚠️ Ważne informacje

1. **Limity FCM:**
   - Maksymalnie 500 powiadomień na batch
   - Funkcja automatycznie dzieli na batche

2. **Tokeny FCM:**
   - Niewažne tokeny są logowane w konsoli
   - TODO: Zaimplementować automatyczne usuwanie

3. **Koszty:**
   - Funkcje działają na planie pay-as-you-go
   - ~$0.40 za milion wywołań
   - Monitoruj użycie w Firebase Console

## 📝 TODO

- [ ] Automatyczne usuwanie nieważnych tokenów FCM
- [ ] Dodanie rate limiting dla wielokrotnych alertów
- [ ] Personalizacja powiadomień (język użytkownika)
- [ ] Statystyki otwarć powiadomień (tracking)
- [ ] Powiadomienia dla znalezionych zwierzaków
