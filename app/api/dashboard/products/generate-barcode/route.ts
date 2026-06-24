import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { buildResponse } from "@/lib/response";
import { auth } from "@/auth";

export const POST = async (req: NextRequest) => {
  const session = await auth();
  const productId = req.nextUrl.searchParams.get("productId") || 0;
  const today = format(new Date(), "yyyyMMdd");

  const count = await prisma.barcode.count({
    where: {
      barcode: {
        startsWith: today,
      },
      storeId: Number(session?.user.storeId),
    },
  });

  const nextBarcode = today + ("000000000" + (count + 1)).slice(-4);

  await prisma.barcode.create({
    data: {
      productId: Number(productId),
      barcode: nextBarcode,
      storeId: Number(session?.user.storeId),
    },
  });

  return buildResponse(nextBarcode);
};
