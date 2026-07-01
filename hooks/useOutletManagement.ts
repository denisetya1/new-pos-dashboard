import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export type OutletPayload = {
  id?: string;
  name: string;
  phone?: string;
  address?: string;
  isActivePOS?: boolean;
  printHeaderLine1?: string;
  printHeaderLine2?: string;
  printHeaderLine3?: string;
  printHeaderLine4?: string;
  printHeaderLine5?: string;
  printExtraInfo?: string;
};

const outletManagementUrl = (qs?: string) => {
  return `/api/dashboard/master-data/outlets${qs ? `?${qs}` : ""}`;
};

export const useGetOutletManagement = (qs: string) => {
  return useQuery({
    queryKey: ["outlet-management", qs],
    queryFn: () => {
      return fetch(outletManagementUrl(qs), {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useCreateOutletManagement = () => {
  return useMutation({
    mutationKey: ["create-outlet-management"],
    mutationFn: (payload: OutletPayload) => {
      return fetch(outletManagementUrl(), {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpdateOutletManagement = () => {
  return useMutation({
    mutationKey: ["update-outlet-management"],
    mutationFn: (payload: OutletPayload) => {
      return fetch(outletManagementUrl(), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useDeleteOutletManagement = () => {
  return useMutation({
    mutationKey: ["delete-outlet-management"],
    mutationFn: (id: string) => {
      return fetch(outletManagementUrl(), {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }).then((res) => handleRes(res));
    },
  });
};
