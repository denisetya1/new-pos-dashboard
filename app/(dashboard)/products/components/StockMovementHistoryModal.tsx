import { ProductWithStocks } from "@/types/product";
import React from "react";
import Modal from "../../components/Modal";
import { Button } from "@/components/ui/button";
import { IoTime } from "react-icons/io5";

const StockMovementHistoryModal = ({
  product,
  outletId,
}: {
  product: ProductWithStocks | null;
  outletId: string;
}) => {
  return (
    <Modal
      title={"Riwayat Perubahan Stok"}
      trigger={
        <Button variant="outline" size="sm">
          <IoTime />
        </Button>
      }
      tooltipText="Riwayat Perubahan Stok"
    >
      add
    </Modal>
  );
};
export default StockMovementHistoryModal;
