import { useQuery } from "@tanstack/react-query";

export const useGetStockMovements = (
  productId: string | null | undefined,
  qs: String,
) => {
  return useQuery({
    queryKey: ["stock-movements", "productId", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/reports/stock-movements/${productId}${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
    enabled: !!productId,
  });
};
