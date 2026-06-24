import { Discount } from "@/generated/prisma/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetDiscounts = (qs: string) => {
  const queryDiscounts = useQuery({
    queryKey: ["discounts", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/products/discounts${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
  });

  return queryDiscounts;
};

export const useCreateDiscount = () => {
  const mutationDiscounts = useMutation({
    mutationKey: ["create-discount"],
    mutationFn: (data: Discount) => {
      return fetch(`/api/dashboard/products/discounts`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
  });

  return mutationDiscounts;
};

export const useUpdateDiscount = () => {
  const mutationDiscounts = useMutation({
    mutationKey: ["update-discount"],
    mutationFn: (data: Discount) => {
      return fetch(`/api/dashboard/products/discounts/${data.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
  });

  return mutationDiscounts;
};
