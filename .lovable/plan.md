

# Plan: Płatności z góry i przenoszenie nadpłat

## Problem

Dwa powiązane problemy:
1. Nie można dodać płatności zanim zawodnik pojawi się na treningu
2. Gdy ktoś płaci np. 200 zł zamiast 150 zł, nie ma możliwości przeniesienia nadpłaty na kolejny miesiąc

## Rozwiązanie

### 1. Sekcja płatności — pokazanie wszystkich zawodników

W `AttendanceView.tsx` sekcja płatności zostanie podzielona na:
- **Główna lista**: zawodnicy z obecnością (jak dotychczas)
- **Składana sekcja "Opłać z góry"**: zawodnicy bez obecności w danym miesiącu, z przyciskiem w szarym stylu

### 2. Przenoszenie nadpłaty na kolejny miesiąc

Przy wpisywaniu płatności dodać opcję podziału kwoty:
- Gracz płaci np. 200 zł
- Użytkownik wpisuje 200 zł i widzi checkbox/przełącznik **"Przenieś nadpłatę na następny miesiąc"**
- Po zaznaczeniu: kwota standardowa (np. 150 zł) zostaje na bieżący miesiąc, a reszta (50 zł) automatycznie tworzy rekord płatności na następny miesiąc

```text
┌─ Wpisz kwotę ───────────────────────┐
│  [200] zł                            │
│  ☑ Przenieś nadpłatę na nast. mies. │
│                                      │
│  Bieżący miesiąc: 150 zł            │
│  Następny miesiąc: 50 zł            │
│                         [✓]  [✕]    │
└──────────────────────────────────────┘
```

### Zmiany w kodzie

**`PaymentToggle.tsx`**:
- Dodać pole checkbox "Przenieś nadpłatę" widoczne gdy wpisana kwota > standardowej (150 zł)
- Dodać wyświetlenie podziału kwoty (bieżący/następny miesiąc)
- Nowy prop `onSplitPayment?: (currentAmount: number, nextMonthAmount: number) => void`
- Prop `currentMonth: string` potrzebny do obliczenia następnego miesiąca

**`usePayments.ts`**:
- Nowa mutacja `splitPayment` — tworzy dwa rekordy: jeden na bieżący miesiąc, drugi na następny
- Logika: insert płatności z `is_paid: true` na oba miesiące z odpowiednimi kwotami

**`AttendanceView.tsx`**:
- Podział zawodników na `playersWithAttendance` i `playersWithoutAttendance`
- Dodanie składanej sekcji (Collapsible z shadcn) z zawodnikami bez obecności
- Przekazanie `onSplitPayment` i `currentMonth` do `PaymentToggle`
- Statystyki `paidCount/total` liczone nadal tylko z grupy z obecnością

**`Index.tsx`**:
- Dodanie handlera `handleSplitPayment` wywołującego nową mutację z `usePayments`

### Baza danych

Brak zmian — obecna tabela `payments` już obsługuje wiele rekordów dla różnych miesięcy. Nadpłata to po prostu drugi rekord INSERT z następnym miesiącem.

### Efekt końcowy

| Scenariusz | Działanie |
|---|---|
| Gracz płaci 150 zł | Normalny zapis jak dotychczas |
| Gracz płaci 200 zł bez przeniesienia | Zapis 200 zł na bieżący miesiąc |
| Gracz płaci 200 zł z przeniesieniem | 150 zł na bieżący + 50 zł na następny miesiąc |
| Gracz nie był na treningu | Widoczny w sekcji "Opłać z góry" |

