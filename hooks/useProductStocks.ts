import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetProductStocks = (qs: string) => {
  return useQuery({
    queryKey: ["products", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/products/stocks?${qs}`, {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpsertProductStock = (productId: string) => {
  return useMutation({
    mutationKey: ["productStock"],
    mutationFn: ({
      quantity,
      moveTypeId,
      description,
      direction,
      moveDate,
      expiredDate,
    }: {
      quantity: number;
      moveTypeId: string;
      description: string;
      direction: string;
      moveDate: Date;
      expiredDate?: Date;
    }) => {
      return fetch(`/api/dashboard/products/${productId}/stock`, {
        method: "POST",
        body: JSON.stringify({
          quantity,
          moveTypeId,
          description,
          direction,
          moveDate,
          expiredDate,
        }),
      }).then((res) => handleRes(res));
    },
  });
};
