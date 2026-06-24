import { useQuery } from "@tanstack/react-query";

export const useGetProducts = (qs: string) => {
  const queryProduct = useQuery({
    queryKey: ["products", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/products?${qs}`, {
        method: "GET",
      }).then(async (res) => {
        const json = await res.json();

        if (res.ok) {
          return json;
        } else {
          throw json;
        }
      });
    },
  });

  return queryProduct;
};

export const useUpdateProducts = () => {};

export const useAddProducts = () => {};
