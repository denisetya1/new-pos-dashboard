import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export type MasterDataType = "brands" | "categories" | "move-types";

export type MasterDataPayload = {
  id?: string;
  name: string;
  description?: string;
  direction?: "IN" | "OUT";
};

const getMasterDataUrl = (type: MasterDataType, qs?: string) => {
  return `/api/dashboard/master-data/${type}${qs ? `?${qs}` : ""}`;
};

export const useGetMasterData = (type: MasterDataType, qs: string) => {
  return useQuery({
    queryKey: ["master-data", type, qs],
    queryFn: () => {
      return fetch(getMasterDataUrl(type, qs), {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useCreateMasterData = (type: MasterDataType) => {
  return useMutation({
    mutationKey: ["create-master-data", type],
    mutationFn: (payload: MasterDataPayload) => {
      return fetch(getMasterDataUrl(type), {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpdateMasterData = (type: MasterDataType) => {
  return useMutation({
    mutationKey: ["update-master-data", type],
    mutationFn: (payload: MasterDataPayload) => {
      return fetch(getMasterDataUrl(type), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useDeleteMasterData = (type: MasterDataType) => {
  return useMutation({
    mutationKey: ["delete-master-data", type],
    mutationFn: (id: string) => {
      return fetch(getMasterDataUrl(type), {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }).then((res) => handleRes(res));
    },
  });
};
