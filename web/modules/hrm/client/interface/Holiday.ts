export interface HolidayDto {
  id: string;
  name: unknown;
  date: string;
  year?: number | null;
  isRecurring: boolean;
  holidayType: string;
  countryCode?: string | null;
  isPaid: boolean;
  isActive: boolean;
  description?: string | null;
  createdAt?: number;
  updatedAt?: number;
}

export interface CreateHolidayPayload {
  name: { vi: string; en?: string };
  date: string;
  year?: number | null;
  isRecurring?: boolean;
  holidayType?: string;
  countryCode?: string;
  isPaid?: boolean;
  isActive?: boolean;
  description?: string | null;
}

export interface UpdateHolidayPayload {
  name?: { vi: string; en?: string };
  isRecurring?: boolean;
  holidayType?: string;
  countryCode?: string;
  isPaid?: boolean;
  isActive?: boolean;
  description?: string | null;
}
