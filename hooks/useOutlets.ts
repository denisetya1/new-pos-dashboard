import { useQuery } from "@tanstack/react-query";

export const useGetOutlet = (outletId: string | undefined) => {
  return useQuery({
    queryKey: ["outlet", outletId],
    queryFn: async () => {
      if (!outletId) throw new Error("Outlet ID is required");

      const res = await fetch(`/api/dashboard/outlets/${outletId}`);
      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(resJson.message || "Failed to fetch outlet data");
      }

      return resJson; // Pastikan selalu me-return data sukses
    },
    enabled: !!outletId && outletId !== "undefined",
  });
};

export const useGetOutlets = () => {
  return useQuery({
    queryKey: ["outlets"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/outlets").then((res) => res.json());
    },
  });
};
