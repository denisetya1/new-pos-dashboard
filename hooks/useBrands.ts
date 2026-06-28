import { useQuery } from "@tanstack/react-query";

export const useGetBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/brands").then((res) => res.json());
    },
  });
};
