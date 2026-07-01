import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export type OutletUserPayload = {
  id?: string;
  outletId: string;
  userId: string;
  roleId: string;
};

const outletUsersUrl = (qs?: string) => {
  return `/api/dashboard/management-outlet/users${qs ? `?${qs}` : ""}`;
};

export const useGetOutletUsers = (qs: string, enabled = true) => {
  return useQuery({
    queryKey: ["outlet-users", qs],
    queryFn: () => {
      return fetch(outletUsersUrl(qs), {
        method: "GET",
      }).then((res) => handleRes(res));
    },
    enabled,
  });
};

export const useCreateOutletUser = () => {
  return useMutation({
    mutationKey: ["create-outlet-user"],
    mutationFn: (payload: OutletUserPayload) => {
      return fetch(outletUsersUrl(), {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpdateOutletUser = () => {
  return useMutation({
    mutationKey: ["update-outlet-user"],
    mutationFn: (payload: OutletUserPayload) => {
      return fetch(outletUsersUrl(), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpdateOutletUserStatus = () => {
  return useMutation({
    mutationKey: ["update-outlet-user-status"],
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      return fetch(outletUsersUrl(), {
        method: "PUT",
        body: JSON.stringify({ id, isActive }),
      }).then((res) => handleRes(res));
    },
  });
};

export const useDeleteOutletUser = () => {
  return useMutation({
    mutationKey: ["delete-outlet-user"],
    mutationFn: (id: string) => {
      return fetch(outletUsersUrl(), {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }).then((res) => handleRes(res));
    },
  });
};

export const useGetRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => {
      return fetch("/api/dashboard/filters/roles", {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};
