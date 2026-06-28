import { Discount } from "@/generated/prisma/client";
import { DiscountFormValues } from "@/schemas/discountSchecma";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetDiscounts = (qs: string) => {
  return useQuery({
    queryKey: ["discounts", qs],
    queryFn: () => {
      return fetch(
        `/api/dashboard/products/discounts${qs !== "" ? `?${qs}` : ""}`,
      ).then((res) => res.json());
    },
  });
};

export const useCreateDiscount = () => {
  return useMutation({
    mutationKey: ["create-discount"],
    mutationFn: (data: DiscountFormValues) => {
      return fetch(`/api/dashboard/products/discounts`, {
        method: "POST",
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
  });
};

export const useUpdateDiscount = (id: string | null | undefined) => {
  return useMutation({
    mutationKey: ["update-discount"],
    mutationFn: (data: DiscountFormValues) => {
      return fetch(`/api/dashboard/products/discounts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }).then((res) => res.json());
    },
  });
};

export const usePatchDiscount = () => {
  return useMutation({
    mutationKey: ["patch-discount"],
    mutationFn: (data: { isActive: boolean; id: string }) => {
      return fetch(`/api/dashboard/products/discounts/${data.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isActive: data.isActive,
        }),
      }).then((res) => res.json());
    },
  });
};

export const useDeleteDiscount = () => {
  return useMutation({
    mutationKey: ["patch-discount"],
    mutationFn: (id: string) => {
      return fetch(`/api/dashboard/products/discounts/${id}`, {
        method: "DELETE",
      }).then((res) => res.json());
    },
  });
};
