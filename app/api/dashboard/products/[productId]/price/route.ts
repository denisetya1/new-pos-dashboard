import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const session = await auth();
  const body = await req.json();
  const { productId } = await params;

  const { cogs, sellPrice, discountPercentage, markupPercentage } = body;

  const updatePrice = await prisma.productStock.upsert({
    where: {
      storeId_productId_outletId: {
        storeId: Number(session?.user.storeId),
        productId: Number(productId),
        outletId: Number(session?.user.outletId),
      },
    },
    update: {
      cogs: Number(cogs),
      sellPrice: Number(sellPrice),
      discountPercentage: Number(discountPercentage),
      markupPercentage: Number(markupPercentage),
      updatedBy: String(session?.user.username),
    },
    create: {
      storeId: 1,
      productId: Number(productId),
      outletId: Number(session?.user.outletId),
      quantity: 0,
      cogs,
      sellPrice,
      discountPercentage: Number(discountPercentage),
      markupPercentage: Number(markupPercentage),
      updatedBy: String(session?.user.username),
      isActive: true,
    },
  });

  return buildResponse(updatePrice);
};
