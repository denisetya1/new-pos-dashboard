import { handleRes } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";

export const useGetProducts = (qs: string) => {
  return useQuery({
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
};

export const useGetProductMultiOutlets = (qs: string) => {
  return useQuery({
    queryKey: ["products-multi-outlets", qs],
    queryFn: () => {
      return fetch(`/api/dashboard/products/stocks/multi-outlets?${qs}`, {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpdateProducts = () => {};

export const useAddProducts = () => {};
