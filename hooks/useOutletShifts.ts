import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

export type OutletShiftPayload = {
  id?: string;
  outletId: string;
  name: string;
  workingHours?: string;
};

const outletShiftsUrl = (qs?: string) => {
  return `/api/dashboard/management-outlet/shifts${qs ? `?${qs}` : ""}`;
};

export const useGetOutletShifts = (qs: string, enabled = true) => {
  return useQuery({
    queryKey: ["outlet-shifts", qs],
    queryFn: () => {
      return fetch(outletShiftsUrl(qs), {
        method: "GET",
      }).then((res) => handleRes(res));
    },
    enabled,
  });
};

export const useCreateOutletShift = () => {
  return useMutation({
    mutationKey: ["create-outlet-shift"],
    mutationFn: (payload: OutletShiftPayload) => {
      return fetch(outletShiftsUrl(), {
        method: "POST",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpdateOutletShift = () => {
  return useMutation({
    mutationKey: ["update-outlet-shift"],
    mutationFn: (payload: OutletShiftPayload) => {
      return fetch(outletShiftsUrl(), {
        method: "PATCH",
        body: JSON.stringify(payload),
      }).then((res) => handleRes(res));
    },
  });
};

export const useUpdateOutletShiftStatus = () => {
  return useMutation({
    mutationKey: ["update-outlet-shift-status"],
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      return fetch(outletShiftsUrl(), {
        method: "PUT",
        body: JSON.stringify({ id, isActive }),
      }).then((res) => handleRes(res));
    },
  });
};

export const useDeleteOutletShift = () => {
  return useMutation({
    mutationKey: ["delete-outlet-shift"],
    mutationFn: (id: string) => {
      return fetch(outletShiftsUrl(), {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }).then((res) => handleRes(res));
    },
  });
};
