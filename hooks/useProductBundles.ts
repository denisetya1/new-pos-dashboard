import { handleRes } from "@/lib/response";
import type { ProductBundleFormValues } from "@/schemas/productBundleSchema";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetProductBundles = (search: string) =>
  useQuery({
    queryKey: ["product-bundles", search],
    queryFn: () =>
      fetch(
        `/api/dashboard/product-bundles${search ? `?search=${encodeURIComponent(search)}` : ""}`,
      ).then(handleRes),
  });

export const useGetBundleProductOptions = (search: string) =>
  useQuery({
    queryKey: ["bundle-product-options", search],
    queryFn: () =>
      fetch(
        `/api/dashboard/product-bundles/products?search=${encodeURIComponent(search)}`,
      ).then(handleRes),
    enabled: search.trim().length >= 2,
  });

export const useCreateProductBundle = () =>
  useMutation({
    mutationFn: (values: ProductBundleFormValues) =>
      fetch("/api/dashboard/product-bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }).then(handleRes),
  });

export const useUpdateProductBundle = (bundleId?: string) =>
  useMutation({
    mutationFn: (values: ProductBundleFormValues) =>
      fetch(`/api/dashboard/product-bundles/${bundleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      }).then(handleRes),
  });

export const useToggleProductBundle = () =>
  useMutation({
    mutationFn: (values: { bundleId: string; isActive: boolean }) =>
      fetch(`/api/dashboard/product-bundles/${values.bundleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: values.isActive }),
      }).then(handleRes),
  });
