import { MonthlySummaryApiResponse } from "@/types/analytics";
import { useQuery } from "@tanstack/react-query";

export const useGetRevenueSummary = () => {
  return useQuery({
    queryKey: ["analytics", "summary"],
    queryFn: () => {
      return fetch("/api/dashboard/analytics", {
        method: "GET",
      }).then((res) => res.json());
    },
  });
};

export const useGetMonthlySummary = () => {
  return useQuery({
    queryKey: ["analytics", "monthly"],
    queryFn: () => {
      return fetch("/api/dashboard/analytics/monthly", {
        method: "GET",
      }).then((res) => res.json() as Promise<MonthlySummaryApiResponse>);
    },
  });
};

export const useGetHourlyTraffics = () => {
  return useQuery({
    queryKey: ["analytics", "hourly-traffics"],
    queryFn: () => {
      return fetch("/api/dashboard/analytics/hourly-traffics", {
        method: "GET",
      }).then((res) => res.json());
    },
  });
};

export const useGetDailyTraffics = () => {
  return useQuery({
    queryKey: ["analytics", "daily-traffics"],
    queryFn: () => {
      return fetch("/api/dashboard/analytics/daily-traffics", {
        method: "GET",
      }).then((res) => res.json());
    },
  });
};
