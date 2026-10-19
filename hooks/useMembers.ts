import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export type MemberPayload = {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  birthDate?: string;
  address?: string;
};

export type PointAdjustmentPayload = {
  memberId: string;
  type: "ADD" | "DEDUCT";
  amount: number;
  reason: string;
};

const membersUrl = (qs?: string) => {
  return `/api/dashboard/members${qs ? `?${qs}` : ""}`;
};

export const useGetMembers = (qs: string) => {
  return useQuery({
    queryKey: ["members", qs],
    queryFn: () => fetch(membersUrl(qs)).then((res) => handleRes(res)),
  });
};

export const useCreateMember = () => {
  return useMutation({
    mutationKey: ["create-member"],
    mutationFn: (payload: MemberPayload) =>
      fetch(membersUrl(), {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res)),
  });
};

export const useUpdateMember = () => {
  return useMutation({
    mutationKey: ["update-member"],
    mutationFn: (payload: MemberPayload) =>
      fetch(membersUrl(), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res)),
  });
};

export const useDeleteMember = () => {
  return useMutation({
    mutationKey: ["delete-member"],
    mutationFn: (id: string) =>
      fetch(membersUrl(), {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }).then((res) => handleRes(res)),
  });
};

export const useGetMemberPoints = (memberId: string, enabled = true) => {
  return useQuery({
    queryKey: ["member-points", memberId],
    queryFn: () =>
      fetch(`/api/dashboard/members/${memberId}/points?limit=100`).then((res) =>
        handleRes(res),
      ),
    enabled: enabled && memberId !== "",
  });
};

export const useAdjustMemberPoints = () => {
  return useMutation({
    mutationKey: ["adjust-member-points"],
    mutationFn: ({ memberId, ...payload }: PointAdjustmentPayload) =>
      fetch(`/api/dashboard/members/${memberId}/points`, {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res)),
  });
};
