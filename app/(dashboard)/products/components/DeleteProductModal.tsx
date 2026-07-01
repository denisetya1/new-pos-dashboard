"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { toast } from "react-toastify";

const DeleteProductModal = ({
  deletedProductName,
  productId,
  open,
  onOpenChange,
  onSuccess,
}: {
  deletedProductName?: string;
  productId?: string;
  open: boolean;
  onOpenChange: (open: boolean | undefined) => void;
  onSuccess: () => void;
}) => {
  const {
    isPending,
    mutate: deleteProduct,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationKey: ["delete", deletedProductName],
    mutationFn: () => {
      return fetch(`/api/dashboard/products/${productId}`, {
        method: "DELETE",
      }).then((res) => res.json());
    },
  });

  useEffect(() => {
    if (isSuccess) {
      onSuccess?.();
      onOpenChange(false);
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      toast.error(error.message, {
        position: "top-right",
        theme: "colored",
      });
    }
  }, [isError, error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl lg:min-w-[50%]">
        <DialogHeader>
          <DialogTitle>Cetak Barcode</DialogTitle>
        </DialogHeader>
        {productId && deletedProductName && (
          <div className="flex-1 overflow-y-auto p-6">
            <div>
              Yakin akan menghapus <strong>{deletedProductName}</strong>?
              <br />
              Fungsi ini akan menghapus produk di semua cabang.
            </div>
          </div>
        )}
        <DialogFooter>
          {isPending ? (
            <div className="flex flex-col items-center">
              <Badge variant="secondary">
                <Spinner data-icon="inline-start" />
                Memproses...
              </Badge>
            </div>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                }}
              >
                Tidak
              </Button>
              <Button type="button" onClick={() => deleteProduct()}>
                Ya
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProductModal;
