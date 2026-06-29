import { useQuery } from "@tanstack/react-query";

export const useGetStockMovements = (
  productId: string | null | undefined,
  qs: String,
  options?: {
    enabled?: boolean;
  },
) => {
  console.log("productId", productId);
  return useQuery({
    queryKey: ["stock-movements", productId, qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/reports/stock-movements/${productId}${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
    enabled: !!productId && options?.enabled !== false,
  });
};
