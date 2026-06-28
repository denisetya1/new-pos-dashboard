import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { format } from "date-fns";

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const session = await auth();
  const body = await req.json();
  const { productId } = await params;

  const {
    quantity,
    moveTypeId,
    description,
    direction,
    moveDate,
    expiredDate,
  } = body;

  const stock = await prisma.productStock.findFirst({
    where: {
      storeId: Number(session?.user.storeId),
      productId: Number(productId),
      outletId: Number(session?.user.outletId),
    },
  });

  let startQuantity = 0;
  let endQuantity = Number(quantity);

  if (stock !== null) {
    startQuantity = stock.quantity;

    if (body.direction === "IN") endQuantity = startQuantity + Number(quantity);
    else endQuantity = startQuantity - Number(quantity);
  }

  const updateStock = await prisma.productStock.upsert({
    where: {
      storeId_productId_outletId: {
        storeId: Number(session?.user.storeId),
        productId: Number(productId),
        outletId: Number(session?.user.outletId),
      },
    },
    update: {
      quantity: {
        increment:
          body.direction === "IN" ? Number(quantity) : -1 * Number(quantity),
      },
      updatedBy: String(session?.user.username),
      stockMovements: {
        create: {
          moveDate: moveDate,
          moveDateStr: format(moveDate, "yyyy-MM-dd"),
          moveTypeId: Number(moveTypeId),
          direction: direction,
          startQuantity,
          quantity: Number(quantity),
          endQuantity,
          expiredDate: expiredDate
            ? new Date(format(expiredDate, "yyyy-MM-dd"))
            : null,
          expiredDateStr: expiredDate ? format(expiredDate, "yyyy-MM-dd") : "",
          description: description,
          updatedBy: String(session?.user.username),
        },
      },
    },
    create: {
      storeId: Number(session?.user.storeId),
      productId: Number(productId),
      outletId: Number(session?.user.outletId),
      quantity: Number(quantity),
      sellPrice: 0,
      sellPriceGrosir: 0,
      minGrosir: 0,
      markupPercentage: 0,
      discountPercentage: 0,
      isActive: true,
      updatedAt: new Date(),
      updatedBy: String(session?.user.username),
      stockMovements: {
        create: {
          moveDate: moveDate,
          moveDateStr: format(moveDate, "dd-MM-yyyy"),
          moveTypeId: Number(moveTypeId),
          direction: direction,
          startQuantity,
          quantity: Number(quantity),
          endQuantity,
          expiredDate: expiredDate
            ? new Date(format(expiredDate, "yyyy-MM-dd"))
            : null,
          expiredDateStr: expiredDate ? format(expiredDate, "yyyy-MM-dd") : "",
          description: description,
          createdAt: new Date(),
          updatedAt: new Date(),
          updatedBy: String(session?.user.username),
        },
      },
    },
  });

  return buildResponse(updateStock);
};
