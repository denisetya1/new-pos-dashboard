"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Modal from "../../components/Modal";
import { useMutation } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { LucideTrash2 } from "lucide-react";

type DeleteProduct = {
  onSuccess?: () => void;
  onCancel?: () => void;
  deletedProductName?: string;
  productId: string;
  closeModal?: () => void;
};

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
      <DialogContent className="sm:max-w-xl max-h-[80%] flex flex-col lg:min-w-[50%]">
        <DialogHeader>
          <DialogTitle>Cetak Barcode</DialogTitle>
        </DialogHeader>
        {productId && deletedProductName && (
          <div>
            <div className="py-4 pb-10">
              Yakin akan menghapus <strong>"{deletedProductName}"</strong>?
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
