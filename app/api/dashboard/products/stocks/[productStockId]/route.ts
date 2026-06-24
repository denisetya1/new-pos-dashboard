import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse, dataNotExistReponse } from "@/lib/response";

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ productStockId: string }> },
) => {
  const session = await auth();
  const body = await req.json();
  const { productStockId } = await params;

  //validate role
  /*if(!checkRole(session?.user?.roles, 'product.update')){
    return notAuthorizeResponse();
  }
  */

  const stock = await prisma.productStock.findFirst({
    where: {
      storeId: Number(session?.user.storeId),
      id: Number(productStockId),
      outletId: Number(session?.user.outletId),
    },
  });

  if (!stock) {
    return dataNotExistReponse();
  }

  const { sellPrice, discountPercentage, markupPercentage } = body;

  //   const updateProduct = await prisma.product.update({
  //     where: {
  //       id: Number(productId),
  //     },
  //     data: {
  //       linkShopee,
  //     },
  //   });

  const updatePrice = await prisma.productStock.upsert({
    where: {
      storeId_productId_outletId: {
        storeId: 1,
        productId: Number(productId),
        outletId: Number(outletId),
      },
    },
    update: {
      sellPrice: Number(sellPrice),
      discountPercentage: Number(discountPercentage),
      markupPercentage: Number(markupPercentage),
    },
    create: {
      storeId: 1,
      productId: Number(productId),
      outletId: Number(outletId),
      quantity: 0,
      minGrosir: 0,
      sellPrice,
      sellPriceGrosir: 0,
      discountPercentage: Number(discountPercentage),
      markupPercentage: Number(markupPercentage),
      isActive: true,
    },
  });

  return buildResponse(updatePrice);
};
