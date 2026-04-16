import { useQuery } from "@tanstack/react-query";

export const useGetCategories = () => {
  const queryCategories = useQuery({
    queryKey: ["categories"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/categories").then((res) =>
        res.json(),
      );
    },
  });

  return queryCategories;
};
