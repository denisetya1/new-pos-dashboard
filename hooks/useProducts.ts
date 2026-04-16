import { useQuery } from "@tanstack/react-query";

export const useGetProducts = (qs: string) => {
  const queryProduct = useQuery({
    queryKey: ["products", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/products?${qs}`, {
        method: "GET",
      }).then((res) => res.json());
    },
  });

  return queryProduct;
};

export const useUpdateProducts = () => {};

export const useAddProducts = () => {};
