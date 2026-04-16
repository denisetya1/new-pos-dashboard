import { useQuery } from "@tanstack/react-query";

export const useGetMoveTypes = () => {
  const queryMovements = useQuery({
    queryKey: ["categories"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/movements").then((res) =>
        res.json(),
      );
    },
  });

  return queryMovements;
};
