import { useQuery } from "@tanstack/react-query";

export const useGetOutlets = () => {
  const queryOutlets = useQuery({
    queryKey: ["outlets"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/outlets").then((res) => res.json());
    },
  });

  return queryOutlets;
};
