## Zmiany w `src/components/views/ReportsView.tsx`

### 1. "Odbyte" — tylko przeszłe, nieodwołane treningi
Aktualnie liczy wszystkie zaplanowane minus odwołane (stąd w lipcu widać 9, mimo że jeszcze żaden się nie odbył).

Dodać filtr po dacie:
```ts
const today = format(new Date(), 'yyyy-MM-dd');
const heldSessions = activeSessions.filter(s => s.date <= today);
```

Kafelek "Odbyte" pokazuje `heldSessions.length` zamiast `activeSessions.length`. Podpis "z X treningów" zostaje jako łączna liczba zaplanowanych w miesiącu.

### 2. "Śr. obecność" — średnia frekwencja na trening
Aktualny wzór: suma obecności ÷ liczba zawodników (średnio ile treningów na jednego zawodnika).

Nowy wzór: suma obecności na odbytych treningach ÷ liczba odbytych treningów (średnio ilu zawodników było na jednym treningu).

```ts
const heldDates = new Set(heldSessions.map(s => s.date));
const totalPresences = attendance.filter(a => a.present && heldDates.has(a.date)).length;
const avgAttendance = heldSessions.length > 0
  ? Math.round(totalPresences / heldSessions.length)
  : 0;
```

Podpis kafelka zmienić z "z X treningów" na "osób/trening" żeby jasno komunikował sens liczby.

### 3. Spójność pozostałych metryk
- "Śr. obecność" i "Zapłacone" — dotychczas bazowały na `activeSessions`; po zmianie używają `heldSessions` tam gdzie chodzi o faktycznie odbyte treningi. Statystyki per‑zawodnik w tabeli (`attendanceCount / totalSessions`) zostają bez zmian — pokazują obecności z odbytych treningów wobec wszystkich aktywnych w miesiącu (informacja "ile jeszcze zostało").

Bez zmian w bazie danych, hookach ani innych widokach.
