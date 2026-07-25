export interface MonthlySummary {
  month: string;
  totalRevenue: number;
  totalCount: number;
  offlineRevenue: number;
  offlineCount: number;
  onlineRevenue: number;
  onlineCount: number;
}

export interface DailyRevenue {
  date: string;
  label: string;
  offlineRevenue: number;
  onlineRevenue: number;
  totalRevenue: number;
}

interface MonthlySummaryApiResponse {
  status: string;
  message: string;
  error: string[];
  data: MonthlySummary[];
}
