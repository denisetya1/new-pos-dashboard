import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetProductStocks = (qs: string) => {
  const queryProductStock = useQuery({
    queryKey: ["products", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/products/stocks?${qs}`, {
        method: "GET",
      }).then((res) => res.json());
    },
  });

  return queryProductStock;
};

export const useUpsertProductStock = (productId: string, outletId: string) => {
  const mutateProductStock = useMutation({
    mutationKey: ["productStock"],
    mutationFn: () => {
      return fetch(`/api/dashboard/products/${productId}/${outletId}/stock`, {
        method: "POST",
      }).then((res) => res.json());
    },
  });

  return mutateProductStock;
};
