import { useMutation, useQuery } from "@tanstack/react-query";

export const useGenerateBarcode = () => {
  return useMutation({
    mutationKey: ["generate-barcode"],
    mutationFn: () => {
      return fetch("/api/dashboard/products/generate-barcode", {
        method: "POST",
      }).then((res) => res.json());
    },
  });
};
