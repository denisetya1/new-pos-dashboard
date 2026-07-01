import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export type SubAccountPayload = {
  name: string;
  username: string;
  phone?: string;
  password: string;
};

const subAccountsUrl = (qs?: string) => {
  return `/api/dashboard/sub-accounts${qs ? `?${qs}` : ""}`;
};

export const useGetSubAccounts = (qs: string) => {
  return useQuery({
    queryKey: ["sub-accounts", qs],
    queryFn: () => {
      return fetch(subAccountsUrl(qs), {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useCreateSubAccount = () => {
  return useMutation({
    mutationKey: ["create-sub-account"],
    mutationFn: (payload: SubAccountPayload) => {
      return fetch(subAccountsUrl(), {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpdateSubAccountStatus = () => {
  return useMutation({
    mutationKey: ["update-sub-account-status"],
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      return fetch(subAccountsUrl(), {
        method: "PATCH",
        body: JSON.stringify({ id, isActive }),
      }).then((res) => handleRes(res));
    },
  });
};

export const useDeleteSubAccount = () => {
  return useMutation({
    mutationKey: ["delete-sub-account"],
    mutationFn: (id: string) => {
      return fetch(subAccountsUrl(), {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }).then((res) => handleRes(res));
    },
  });
};
