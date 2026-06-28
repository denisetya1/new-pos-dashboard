"use client";

import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Modal from "../../components/Modal";
import { LucidePrinter } from "lucide-react";
import { Product } from "@/generated/prisma/client";
import { useReactToPrint } from "react-to-print";
import { useRef, useState } from "react";
import Barcode from "react-barcode";

type DeleteProduct = {
  onSuccess?: () => void;
  onCancel?: () => void;
  deletedProductName?: string;
  product: Product;
  closeModal?: () => void;
};

const PrintBarcode = ({ product }: DeleteProduct) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({ contentRef });

  return (
    <div className="w-full flex flex-col justify-center items-center bg-white p-6 rounded-md border border-slate-200">
      <div className="border border-slate-400 p-5 py-0">
        <div
          ref={contentRef}
          className="w-37.5 flex flex-col items-center justify-center text-center p-1"
        >
          <div className="w-full text-[9px] text-left z-10 capitalize px-1">
            {product.name.substring(0, 30).toLowerCase()}
          </div>
          <div className="-mt-2.5">
            {product.barcode !== null && product.barcode !== "" && (
              <Barcode
                height={22}
                width={1}
                displayValue={false}
                value={product.barcode}
              />
            )}
          </div>
          <div className="text-[10px] -mt-2.5">{product.barcode}</div>
        </div>
      </div>

      <div className="flex justify-end align-middle mt-10">
        <Button color="purple" onClick={handlePrint}>
          Cetak Barcode
        </Button>
      </div>

      <DialogFooter></DialogFooter>
    </div>
  );
};

const PrintBarcodeModal = ({
  deletedProductName,
  product,
}: {
  deletedProductName: string;
  product: Product;
}) => {
  return (
    <Modal
      title="Cetak Barcode"
      trigger={
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-green-600  flex justify-baseline"
        >
          <LucidePrinter className="text-green-600" /> Print Barcode
        </Button>
      }
    >
      <PrintBarcode deletedProductName={deletedProductName} product={product} />
    </Modal>
  );
};

export default PrintBarcodeModal;
