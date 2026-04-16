import { useQuery } from "@tanstack/react-query";

export const useGetBrands = () => {
  const queryBrands = useQuery({
    queryKey: ["brands"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/brands").then((res) => res.json());
    },
  });

  return queryBrands;
};
