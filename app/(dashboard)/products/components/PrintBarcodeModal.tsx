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
import { Product } from "@/generated/prisma/client";
import { useReactToPrint } from "react-to-print";
import { useRef } from "react";
import Barcode from "react-barcode";

const PrintBarcodeModal = ({
  product,
  open,
  onOpenChange,
}: {
  product?: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[80%] flex flex-col lg:min-w-[50%]">
        <DialogHeader>
          <DialogTitle>Cetak Barcode</DialogTitle>
        </DialogHeader>

        {product && (
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
        )}

        <DialogFooter>
          <Button
            variant={"outline"}
            color=""
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
          <Button color="purple" onClick={handlePrint}>
            Cetak Barcode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PrintBarcodeModal;
