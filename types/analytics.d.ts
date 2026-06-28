export interface MonthlySummary {
  month: string;
  totalRevenue: number;
  totalCount: number;
  offlineRevenue: number;
  offlineCount: number;
  onlineRevenue: number;
  onlineCount: number;
}

interface MonthlySummaryApiResponse {
  status: string;
  message: string;
  error: string[];
  data: MonthlySummary[];
}
