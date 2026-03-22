

# Plan: Stan kasy — tylko faktyczne dane

## Problem

`getHallCost()` zwraca domyślnie 1100 zł nawet gdy koszt hali nie został wpisany. To powoduje, że stan kasy odejmuje hipotetyczne koszty za miesiące, w których skarbnik jeszcze nic nie wprowadził — generując zamieszanie.

## Rozwiązanie

Zmienić logikę tak, aby koszt hali był odejmowany **tylko gdy został jawnie wpisany** w danym miesiącu. Brak wpisu = 0 zł kosztu.

## Zmiany

### `useHallCosts.ts`
- Zmienić `getHallCost()`: zamiast `return cost?.amount ?? 1100` → `return cost?.amount ?? 0`
- Dodać nową funkcję `hasHallCost(month): boolean` — zwraca `true` tylko gdy istnieje rekord dla danego miesiąca

### `ReportsView.tsx`
- W widoku miesięcznym: jeśli `hasHallCost` jest `false`, wyświetlić placeholder "Nie wprowadzono" zamiast kwoty 1100 zł
- `totalCashBalance`: bez zmian w logice — po zmianie `getHallCost` na domyślne 0, koszty będą odejmowane tylko gdy wpisane
- `monthlyBalance`: analogicznie — pokaże bilans bez kosztu hali jeśli nie został wpisany

### Efekt
- Stan kasy = suma wpłat − suma **wpisanych** kosztów hali − suma **wpisanych** wydatków
- Żadnych domyślnych odejmowań — skarbnik widzi dokładnie to, co zostało wprowadzone

