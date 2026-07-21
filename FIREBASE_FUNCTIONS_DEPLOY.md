# 🚀 KROK 4: Wdrożenie Firebase Cloud Functions

## Wymagania wstępne

1. **Firebase CLI** (jeśli nie masz):
```bash
npm install -g firebase-tools
```

2. **Zaloguj się do Firebase**:
```bash
firebase login
```

3. **Upewnij się, że projekt jest ustawiony**:
```bash
firebase use paway-d9573
```

## 📤 Deploy Cloud Functions

### Deploy wszystkich funkcji (zalecane):
```bash
firebase deploy --only functions
```

### Deploy konkretnej funkcji:
```bash
# Tylko funkcja sendSOSNotifications
firebase deploy --only functions:sendSOSNotifications

# Tylko cleanup
firebase deploy --only functions:cleanupExpiredAlerts
```

### Deploy z logami w czasie rzeczywistym:
```bash
firebase deploy --only functions --debug
```

## ⏱️ Czas deploymentu
- Pierwsze wdrożenie: **3-5 minut**
- Kolejne aktualizacje: **1-2 minuty**

## ✅ Weryfikacja po wdrożeniu

1. **Sprawdź status funkcji w konsoli**:
   https://console.firebase.google.com/project/paway-d9573/functions

2. **Przetestuj lokalnie najpierw** (opcjonalnie):
```bash
cd functions
npm run serve
```

3. **Monitoruj logi**:
```bash
# Logi w czasie rzeczywistym
firebase functions:log --only sendSOSNotifications

# Wszystkie logi
firebase functions:log
```

## 🧪 Testowanie

### 1. Utwórz testowy alert SOS
W aplikacji mobilnej:
- Przejdź do sekcji SOS
- Utwórz nowy alert o zagubionym zwierzaku
- Funkcja automatycznie wykryje nowy dokument

### 2. Sprawdź logi
```bash
firebase functions:log --only sendSOSNotifications
```

Powinny pojawić się logi:
```
🚨 New SOS Alert: abc123
📍 Alert location: 52.2297, 21.0122
📡 Notification radius: 10km
👥 Found X users in 10km radius
✅ Notifications sent successfully: X
```

### 3. Sprawdź powiadomienie na telefonie
- Upewnij się, że aplikacja ma zgodę na powiadomienia
- Sprawdź czy powiadomienie przyszło
- Kliknij powiadomienie - powinno otworzyć szczegóły alertu

## 🔧 Konfiguracja dodatkowa

### Aktywacja scheduled funkcji (cleanup)
Funkcja `cleanupExpiredAlerts` wymaga planu Blaze (pay-as-you-go):
```bash
firebase deploy --only functions:cleanupExpiredAlerts
```

**Uwaga**: Jeśli nie masz planu Blaze, pomiń tę funkcję lub usuń ją z `index.js`.

## 💰 Koszty

### Cloud Functions (v2)
- **Darmowe miesięcznie**:
  - 2 miliony wywołań
  - 400,000 GB-sekund
  - 200,000 GHz-sekund
  
- **Po przekroczeniu**:
  - $0.40 za milion wywołań
  - $0.0000025 za GB-sekundę
  - $0.0000100 za GHz-sekundę

### FCM (Firebase Cloud Messaging)
- **Całkowicie darmowe** - bez limitów!

### Szacunkowe koszty dla Paway:
- 100 alertów dziennie × 50 użytkowników w zasięgu = 5,000 wywołań/dzień
- **150,000 wywołań/miesiąc = DARMOWE** (w ramach free tier)

## 🛠️ Troubleshooting

### Błąd: "Error: HTTP Error: 403, Permission denied"
**Rozwiązanie**: Upewnij się, że masz uprawnienia do projektu:
```bash
firebase projects:list
```

### Błąd: "Deploy requires Blaze plan"
**Rozwiązanie**: Tylko dla scheduled funkcji. Usuń `cleanupExpiredAlerts` z `index.js` lub upgrade do Blaze.

### Powiadomienia nie przychodzą
**Sprawdź**:
1. Czy funkcja została wdrożona: `firebase functions:list`
2. Czy użytkownik ma zapisany `fcmToken` w Firestore
3. Czy użytkownik ma ustawioną `lastLocation`
4. Czy `google-services.json` jest w `android/app/`
5. Logi: `firebase functions:log`

### Błąd: "firebase: command not found"
**Rozwiązanie**: Zainstaluj Firebase CLI:
```bash
npm install -g firebase-tools
```

## 📊 Monitoring produkcyjny

### Dashboard Firebase Functions:
https://console.firebase.google.com/project/paway-d9573/functions

### Metryki do śledzenia:
- ✅ Invocations (wywołania)
- ⏱️ Execution time (czas wykonania)
- ❌ Error rate (błędy)
- 💰 Cost (koszty)

### Alerty (opcjonalne):
Ustaw alerty w Firebase Console dla:
- Error rate > 5%
- Execution time > 30s
- Cost > $10/dzień

## 🎯 Następne kroki po wdrożeniu

1. ✅ Deploy funkcji
2. 🧪 Przetestuj na urządzeniu
3. 📊 Monitoruj logi przez 24h
4. 🔔 Zbierz feedback od użytkowników
5. 📈 Optymalizuj zasięg/promień jeśli potrzeba

## 📝 Changelog funkcji

### sendSOSNotifications v1.0
- ✅ Geohash queries (10km radius)
- ✅ Batch sending (500 per batch)
- ✅ Android & iOS support
- ✅ Photo in notification
- ✅ Distance calculation
- ✅ Stats tracking
- ⏳ TODO: Invalid token cleanup
- ⏳ TODO: Rate limiting

### cleanupExpiredAlerts v1.0
- ✅ Daily schedule (00:00)
- ✅ 7-day retention for resolved alerts
- ✅ Batch deletion
