import { useMutation } from "@tanstack/react-query";

export const useUpsertProductPrice = (productId: string) => {
  const mutateProductStock = useMutation({
    mutationKey: ["productStock"],
    mutationFn: ({
      cogs,
      sellPrice,
      markupPercentage,
      discountPercentage,
    }: {
      cogs: number;
      sellPrice: number;
      markupPercentage: number;
      discountPercentage: number;
    }) => {
      return fetch(`/api/dashboard/products/${productId}/price`, {
        method: "POST",
        body: JSON.stringify({
          cogs,
          sellPrice,
          markupPercentage,
          discountPercentage,
        }),
      }).then(async (res) => {
        try {
          const response = await res.json();

          if (res.ok) {
            return response;
          } else {
            throw response;
          }
        } catch (e) {
          throw e;
        }
      });
    },
  });

  return mutateProductStock;
};
