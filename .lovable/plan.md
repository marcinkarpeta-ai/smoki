# Rola "Zawodnik" - dostęp tylko do odczytu

## Cel
Umożliwić zawodnikom drużyny podgląd swoich obecności i płatności bez ujawniania aplikacji osobom postronnym. Wspólne hasło "team access", jedno konto techniczne w bazie, admin może je zmienić z panelu Użytkowników.

## Jak to działa (dla użytkownika)
- Na ekranie logowania pojawia się nowy przycisk **"Zaloguj jako Zawodnik"**.
- Otwiera się pole na jedno hasło (bez maila). Po poprawnym haśle następuje logowanie do wspólnego konta "Zawodnik".
- Zawodnik widzi zakładki **Obecność**, **Płatności**, **Raporty** — wszystko wyłącznie do podglądu. Może rozwijać karty w "Historia płatności zawodników".
- Nie widzi zakładek **Zawodnicy** i **Użytkownicy**, nie może dodawać/edytować/usuwać danych ani zmieniać haseł.
- Admin w zakładce **Użytkownicy** ma nowy przycisk **"Zmień hasło Zawodnika"**.

## Zakres zmian

### 1. Baza danych (migracja)
- Dodać wartość `'player'` do enum `app_role`.
- Utworzyć tabelę `player_access` (jeden wiersz): `password_hash` (bcrypt), `updated_at`, `updated_by`. Pełny RLS — brak dostępu z klienta; tylko edge functions (service role).
- Rozszerzyć politykę SELECT na tabelach `players`, `attendance`, `payments`, `hall_costs`, `other_expenses`, `cancelled_sessions`, `profiles` tak, aby użytkownicy z rolą `player` mogli odczytywać (INSERT/UPDATE/DELETE pozostają niedostępne).
- Wyłączyć maskowanie e-maili dla `player` (i tak jest już maskowane dla nie-adminów — bez zmian).
- `handle_new_user` bez zmian; techniczne konto zawodnika tworzone przez edge function poniżej.

### 2. Edge functions
- `player-login` (publiczna, verify_jwt=false):
  - Wejście: `{ password }`.
  - Pobiera hash z `player_access`, weryfikuje bcrypt.
  - Jeśli OK — loguje wspólne konto techniczne (`admin.generateLink` typu magiclink dla ustalonego maila `player@smoki.local` lub `admin.createSession`) i zwraca `access_token` + `refresh_token`, które klient ustawia przez `supabase.auth.setSession`.
  - Rate limit: prosty licznik nieudanych prób w pamięci/tablicy `player_login_attempts` (opcjonalnie).
- `set-player-password` (verify_jwt=false, sprawdza rolę admina w kodzie):
  - Wejście: `{ password }` (min. 8 znaków, walidacja Zod).
  - Hashuje bcrypt i zapisuje w `player_access`.
- Bootstrap konta: przy pierwszym `set-player-password` funkcja tworzy usera `player@smoki.local` (jeśli nie istnieje), przypisuje mu rolę `player` w `user_roles`.

### 3. Frontend
- `src/pages/Auth.tsx`: dodać drugą kartę / przełącznik "Zawodnik" z jednym polem hasła; wywołuje `player-login` i `supabase.auth.setSession`.
- `src/contexts/AuthContext.tsx`: dodać `isPlayer`; wszystkie flagi `canManage*`, `canAdd*`, `canDelete*`, `canViewPlayersTab`, `canManageUsers` = false dla `player`.
- `src/components/BottomNav.tsx`: dla `player` pokazywać tylko Obecność / Płatności / Raporty / Wyloguj.
- `src/components/views/AttendanceView.tsx` i `PaymentsView.tsx`: już respektują `canEdit*` (checkboxy/toggle'e disabled). Zweryfikować, że w trybie `player` nic klikalnego się nie renderuje (ukryć przyciski "Anuluj trening", picker jest ok).
- `src/components/PlayerPaymentHistory.tsx`: bez zmian — jest już tylko do odczytu i rozwijane.
- `src/components/views/UsersView.tsx`: dodać sekcję "Hasło zawodnika" z przyciskiem "Zmień hasło", widoczną tylko dla admina; wywołuje `set-player-password`.
- `src/pages/Index.tsx`: routing/zakładki zablokowane dla `player` (redirect na Raporty jeśli spróbuje wejść w Zawodnicy/Użytkownicy).

### 4. Bezpieczeństwo
- Hasło nigdy nie trafia do klienta ani do logów; bcrypt cost ≥ 10.
- Konto techniczne `player@smoki.local` — e-mail poza domeną, nie da się przez nie przejść resetu hasła (reset i tak wyłączony w UI dla playera).
- Rola `player` egzekwowana w RLS; frontendowe flagi to tylko UX.
- Publiczna funkcja `player-login` bez CORS wildcard na innych trasach i z walidacją Zod.

## Uwaga
Wspólne hasło = wszyscy zawodnicy widzą dane wszystkich (imiennie, kwoty, zaległości) — tak jak potwierdziłeś w pytaniach. Jeśli hasło wycieknie, admin zmienia je jednym kliknięciem w Użytkownikach.
