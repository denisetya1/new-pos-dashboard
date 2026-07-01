import { useQuery } from "@tanstack/react-query";

export const useGetShifts = () => {
  return useQuery({
    queryKey: ["shifts"],
    queryFn: () => {
      return fetch(`/api/dashboard/filters/shifts`).then((res) => res.json());
    },
  });
};

export const useGetPaymentMethods = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: () => {
      return fetch(`/api/dashboard/filters/payment-methods`).then((res) =>
        res.json(),
      );
    },
  });
};
