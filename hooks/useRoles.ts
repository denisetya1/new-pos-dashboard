import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export type RolePayload = {
  name: string;
};

const rolesUrl = (qs?: string) => {
  return `/api/dashboard/user-management/roles${qs ? `?${qs}` : ""}`;
};

export const useGetRoleManagement = (qs: string) => {
  return useQuery({
    queryKey: ["role-management", qs],
    queryFn: () => {
      return fetch(rolesUrl(qs), {
        method: "GET",
      }).then((res) => handleRes(res));
    },
  });
};

export const useCreateRole = () => {
  return useMutation({
    mutationKey: ["create-role"],
    mutationFn: (payload: RolePayload) => {
      return fetch(rolesUrl(), {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};
