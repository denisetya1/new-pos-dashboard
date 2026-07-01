import { useQuery } from "@tanstack/react-query";

export const useGetOfflineSalesReport = (qs: String) => {
  return useQuery({
    queryKey: ["salesReport", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/reports/sales${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
  });
};

export const useGetOnlineSalesReport = (qs: String) => {
  return useQuery({
    queryKey: ["salesReport", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/reports/sales/online${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
  });
};
