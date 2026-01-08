export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface AttendanceRecord {
  date: string;
  playerId: string;
  present: boolean;
}

export interface PaymentRecord {
  month: string; // Format: YYYY-MM
  playerId: string;
  paid: boolean;
}

export interface TrainingSession {
  date: string;
  dayOfWeek: string;
}

export interface CancelledSession {
  id: string;
  sessionDate: string;
  reason: string;
  cancelledBy: string | null;
  createdAt: string;
}
