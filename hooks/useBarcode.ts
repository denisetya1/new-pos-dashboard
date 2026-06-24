import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetBarcode = () => {
  const queryBarcode = useMutation({
    mutationKey: ["generate-barcode"],
    mutationFn: () => {
      return fetch("/api/dashboard/products/generate-barcode", {
        method: "POST",
      }).then((res) => res.json());
    },
  });

  return queryBarcode;
};
