"use client";

import { DialogFooter } from "@/components/ui/dialog";
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

const ConfirmDeleteProduct = ({
  onSuccess,
  onCancel,
  deletedProductName,
  productId,
  closeModal,
}: DeleteProduct) => {
  const {
    isPending,
    data,
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
    <div>
      <div className="py-4 pb-10">
        Yakin akan menghapus <strong>"{deletedProductName}"</strong>?
        <br />
        Fungsi ini akan menghapus produk di semua cabang.
      </div>

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
                onCancel?.();
                closeModal?.();
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
    </div>
  );
};

const DeleteProductModal = ({
  deletedProductName,
  productId,
  onOpenChange,
}: {
  deletedProductName: string;
  productId: string;
  onOpenChange?: (open: boolean) => void;
}) => {
  return (
    <Modal
      title="Hapus Produk"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-red-400 flex justify-baseline"
        >
          <LucideTrash2 className="text-red-400" /> Hapus Produk
        </Button>
      }
      onOpenChange={onOpenChange}
    >
      <ConfirmDeleteProduct
        deletedProductName={deletedProductName}
        productId={productId}
      />
    </Modal>
  );
};

export default DeleteProductModal;
