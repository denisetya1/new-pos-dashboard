import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export type StoreConfigPayload = {
  name: string;
  pointRewardEnabled: boolean;
  pointEarningThreshold: number;
  pointRedemptionValue: number;
  minimumRedemptionPoints: number;
};

const storeConfigUrl = "/api/dashboard/settings/store";

export const useGetStoreConfig = () => {
  return useQuery({
    queryKey: ["store-config"],
    queryFn: () => fetch(storeConfigUrl).then((res) => handleRes(res)),
  });
};

export const useUpdateStoreConfig = () => {
  return useMutation({
    mutationKey: ["update-store-config"],
    mutationFn: (payload: StoreConfigPayload) =>
      fetch(storeConfigUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res)),
  });
};
