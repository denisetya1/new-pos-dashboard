import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse, dataNotExistReponse } from "@/lib/response";

export const PATCH = async (
  _req: Request,
  { params }: { params: Promise<{ movementId: string }> },
) => {
  const session = await auth();
  const { movementId } = await params;

  const stockMovement = await prisma.stockMovement.findFirst({
    where: {
      id: Number(movementId),
      productStock: {
        storeId: Number(session?.user.storeId),
        outletId: Number(session?.user.outletId),
      },
    },
    select: {
      id: true,
    },
  });

  if (stockMovement === null) {
    return dataNotExistReponse();
  }

  const updatedStockMovement = await prisma.stockMovement.update({
    where: {
      id: Number(movementId),
    },
    data: {
      soldOut: true,
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse({
    ...updatedStockMovement,
    id: updatedStockMovement.id.toString(),
    productStockId: updatedStockMovement.productStockId.toString(),
    moveTypeId: updatedStockMovement.moveTypeId.toString(),
    supplierId: updatedStockMovement.supplierId?.toString(),
  });
};
