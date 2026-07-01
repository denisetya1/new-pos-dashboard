import { handleRes } from "@/lib/response";
import { useMutation, useQuery } from "@tanstack/react-query";

const outletPaymentMethodsUrl = (qs?: string) => {
  return `/api/dashboard/management-outlet/payment-methods${qs ? `?${qs}` : ""}`;
};

export const useGetOutletPaymentMethods = (qs: string, enabled = true) => {
  return useQuery({
    queryKey: ["outlet-payment-methods", qs],
    queryFn: () => {
      return fetch(outletPaymentMethodsUrl(qs), {
        method: "GET",
      }).then((res) => handleRes(res));
    },
    enabled,
  });
};

export const useUpdateOutletPaymentMethodStatus = () => {
  return useMutation({
    mutationKey: ["update-outlet-payment-method-status"],
    mutationFn: ({
      outletId,
      paymentMethodId,
      isActive,
    }: {
      outletId: string;
      paymentMethodId: string;
      isActive: boolean;
    }) => {
      return fetch(outletPaymentMethodsUrl(), {
        method: "PATCH",
        body: JSON.stringify({ outletId, paymentMethodId, isActive }),
      }).then((res) => handleRes(res));
    },
  });
};
