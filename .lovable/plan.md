# Plan: Cofanie się do treningów z poprzednich miesięcy w zakładce Obecność

## Problem

`DateSelector` generuje listę treningów tylko dla miesiąca aktualnie wybranej daty (`getTrainingSessions(new Date(selectedDate))`). Gdy jesteś na pierwszym treningu miesiąca (np. 2 lipca), strzałka "wstecz" jest zablokowana — nie można wrócić do ostatniego treningu z czerwca.

## Rozwiązanie

Zmienić logikę `DateSelector` tak, aby operowała na **zakresie miesięcy** (aktualny miesiąc ± 6 miesięcy w tył od dzisiaj, do miesiąca bieżącej daty), a nie tylko na jednym miesiącu wybranej daty. Dzięki temu strzałki będą płynnie przechodzić między treningami z różnych miesięcy.

Dolna granica: styczeń 2026 (spójnie z limitem w płatnościach i raportach).
Górna granica: nie potrzebna — treningi w przyszłości są normalną częścią użytku.

## Zmiany w kodzie

### `src/components/DateSelector.tsx`

- Zamiast `getTrainingSessions(new Date(selectedDate))` — wygenerować sesje dla **całego zakresu** od `2026-01` do co najmniej miesiąca 2 miesiące w przód od dzisiaj (i nie mniej niż miesiąc wybranej daty).
- Strzałki `handlePrev` / `handleNext` będą działać na tej pełnej liście — automatycznie przejdą do poprzedniego/następnego miesiąca gdy dotrą do brzegu bieżącego.
- Picker (rozwijana lista) też pokaże pełny zakres, pogrupowany chronologicznie. Aby uniknąć bardzo długiej listy, picker będzie automatycznie przewijał się do wybranej daty przy otwieraniu.

### `src/utils/dateUtils.ts` (opcjonalnie)

- Dodać helper `getTrainingSessionsInRange(startDate: Date, endDate: Date)` zwracający treningi z zadanego zakresu — czystsze niż wołanie `getTrainingSessions` w pętli po miesiącach.

## Bez zmian

- `AttendanceView` — używa istniejącego API `DateSelector` (props `selectedDate`, `onDateChange`), więc żadne zmiany nie są tam potrzebne.
- Uprawnienia / RLS — obecne polityki już pozwalają zapisywać obecność za dowolną datę.
- Baza danych — bez zmian.

## Efekt

- Ze strzałki "wstecz" na 2 lipca cofniesz się do ostatniego treningu czerwca.
- Możesz uzupełnić brakującą obecność za dowolny trening od stycznia 2026.
- Picker daty pokazuje pełną historię treningów, a nie tylko miesiąc bieżącej daty.