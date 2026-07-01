import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetStockMovements = (
  productId: string | null | undefined,
  qs: string,
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

export const useGetExpiredProducts = (qs: string) => {
  return useQuery({
    queryKey: ["expired-products", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/reports/products/expired?${qs}`, {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useGetLowStockProducts = (qs: string) => {
  return useQuery({
    queryKey: ["low-stock-products", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/reports/stocks/low-stock?${qs}`, {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useGetTopSellerReport = (qs: string) => {
  return useQuery({
    queryKey: ["top-seller-report", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/reports/products/top-sellers?${qs}`, {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useSetExpiredProductSoldOut = () => {
  return useMutation({
    mutationKey: ["set-expired-product-sold-out"],
    mutationFn: (movementId: string) => {
      return fetch(
        `/api/dashboard/reports/products/expired/${movementId}/sold-out`,
        {
          method: "PATCH",
        },
      ).then((res) => handleRes(res));
    },
  });
};
