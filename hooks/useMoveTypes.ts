import { useQuery } from "@tanstack/react-query";

export const useGetMoveTypes = (direction: string) => {
  return useQuery({
    queryKey: ["movetypes", direction],
    queryFn: () => {
      return fetch(
        `/api/dashboard/filters/movements?direction=${direction}`,
      ).then((res) => res.json());
    },
  });
};
