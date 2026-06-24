import { useQuery } from "@tanstack/react-query";

export const useGetSalesReport = (qs: String) => {
  const queryBrands = useQuery({
    queryKey: ["salesReport", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/reports/sales${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
  });

  return queryBrands;
};
