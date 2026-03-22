

# Plan: Nawigacja płatności między miesiącami

## Problem

Sekcja płatności jest zablokowana na bieżący miesiąc (`getCurrentMonth()`). Nie można przejść do przyszłych miesięcy (np. kwiecień), żeby wpisać płatność z góry.

## Rozwiązanie

Dodać nawigację miesiącami (strzałki lewo/prawo) w nagłówku sekcji płatności, analogicznie do nawigacji dat w sekcji obecności.

```text
┌─ Płatności ─────────────────────────┐
│  ◀  Marzec 2026  ▶     3/5         │
│  ...                                │
└─────────────────────────────────────┘
```

- Nawigacja pozwala przechodzić od najstarszego miesiąca (w którym istnieje jakakolwiek obecność lub płatność) aż do **bieżący miesiąc + 2** (żeby można było opłacić przyszłe miesiące).
- Domyślnie wybrany jest bieżący miesiąc.

## Zmiany w kodzie

### `AttendanceView.tsx`
- Zamienić `const currentMonth = getCurrentMonth()` na `const [paymentMonth, setPaymentMonth] = useState(getCurrentMonth())`
- Dodać funkcje `handlePrevMonth` / `handleNextMonth` (używając `addMonths` / `format` z `date-fns`)
- Dodać przyciski nawigacji (strzałki) obok nagłówka "Płatności - {miesiąc}"
- Przeliczyć `playersWithAttendance` i `playersWithoutAttendance` na podstawie `paymentMonth` (nie tylko bieżącego miesiąca)
- Zaktualizować wszystkie odwołania do `currentMonth` → `paymentMonth`

### Bez zmian
- Baza danych — bez zmian
- `usePayments.ts` — bez zmian (już obsługuje dowolny miesiąc)
- `Index.tsx` — bez zmian (handlery przyjmują miesiąc jako parametr)

