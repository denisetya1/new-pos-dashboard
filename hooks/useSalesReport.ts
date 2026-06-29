import { useQuery } from "@tanstack/react-query";

export const useGetSalesReport = (qs: String) => {
  return useQuery({
    queryKey: ["salesReport", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/reports/sales${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
  });
};

export const useGetTransacationDetails = (transactionId: string) => {
  return useQuery({
    queryKey: ["transcation-detail", transactionId],
    queryFn: () => {
      return fetch(`/api/dashboard/reports/sales/${transactionId}`).then(
        (res) => res.json(),
      );
    },
  });
};
