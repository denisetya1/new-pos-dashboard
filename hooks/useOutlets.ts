import { useQuery } from "@tanstack/react-query";

export const useGetOutlet = (outletId: string | undefined) => {
  const queryOutlet = useQuery({
    queryKey: ["outlet", outletId],
    queryFn: () => {
      return fetch(`/api/dashboard/outlets/${outletId}`).then(async (res) => {
        try {
          const resJson = await res.json();
          console.log("sss", resJson);
          if (!res.ok) {
            throw resJson;
          }
          return resJson;
        } catch (e) {}
      });
    },
    enabled: !!outletId,
  });

  return queryOutlet;
};

export const useGetOutlets = () => {
  const queryOutlets = useQuery({
    queryKey: ["outlets"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/outlets").then((res) => res.json());
    },
  });

  return queryOutlets;
};
