"use client";

import { Product } from "@/generated/prisma/client";
import Barcode from "react-barcode";

type MyProps = {
  product: Product;
};

const BarcodePrintComponent = ({ product }: MyProps) => {
  return (
    <div className="w-37.5 flex flex-col items-center justify-center text-center p-1">
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
  );
};

export default BarcodePrintComponent;
