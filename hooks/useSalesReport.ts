import { useQuery } from "@tanstack/react-query";

export const useGetOfflineSalesReport = (qs: string) => {
  return useQuery({
    queryKey: ["offlineSalesReport", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/reports/sales${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
  });
};

export const useGetOnlineSalesReport = (qs: string) => {
  return useQuery({
    queryKey: ["onlineSalesReport", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/reports/sales/online${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
  });
};
