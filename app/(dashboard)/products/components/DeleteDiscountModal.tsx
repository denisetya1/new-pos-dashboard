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

type DeleteDiscount = {
  onSuccess?: () => void;
  onCancel?: () => void;
  deletedProductName?: string;
  discountId: string;
  closeModal?: () => void;
};

const ConfirmDeleteDiscount = ({
  onSuccess,
  onCancel,
  deletedProductName,
  discountId,
  closeModal,
}: DeleteDiscount) => {
  const {
    isPending,
    data,
    mutate: deleteDiscount,
    isSuccess,
    isError,
    error,
  } = useMutation({
    mutationKey: ["delete", deletedProductName],
    mutationFn: () => {
      return fetch(`/api/dashboard/discounts/${discountId}`, {
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
            <Button type="button" onClick={() => deleteDiscount()}>
              Ya
            </Button>
          </>
        )}
      </DialogFooter>
    </div>
  );
};

const DeleteDiscountModal = ({
  deletedProductName,
  discountId,
  open,
  onOpenChange,
}: {
  deletedProductName: string;
  discountId: string;
  open?: boolean;
  onOpenChange?: (open: boolean | undefined) => void;
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
      <ConfirmDeleteDiscount
        deletedProductName={deletedProductName}
        discountId={discountId}
      />
    </Modal>
  );
};

export default DeleteDiscountModal;
