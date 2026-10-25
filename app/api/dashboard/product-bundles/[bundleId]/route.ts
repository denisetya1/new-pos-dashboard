import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
  notAuthorizeResponse,
} from "@/lib/response";
import { productBundleSchema } from "@/schemas/productBundleSchema";
import { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ bundleId: string }> };

export const PUT = async (req: NextRequest, { params }: RouteContext) => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);
  const { bundleId } = await params;

  if (!session || !Number.isFinite(storeId)) {
    return notAuthorizeResponse();
  }

  try {
    const parsed = productBundleSchema.safeParse(await req.json());
    if (!parsed.success) {
      return buildErrorResponse(
        "VALIDATION_ERROR",
        "Data bundle belum lengkap.",
        parsed.error.issues.map((issue) => issue.message),
      );
    }

    const bundle = await prisma.productBundle.findFirst({
      where: { id: BigInt(bundleId), storeId },
      select: { id: true, productId: true },
    });
    if (!bundle) {
      return dataNotExistReponse();
    }

    const values = parsed.data;
    const productIds = values.items.map((item) => BigInt(item.productId));
    if (new Set(productIds.map(String)).size !== productIds.length) {
      return buildErrorResponse(
        "DUPLICATE_PRODUCT",
        "Satu produk hanya boleh dipilih sekali dalam bundle.",
        [],
      );
    }

    const [products, category, brand, duplicateCode] = await Promise.all([
      prisma.product.findMany({
        where: {
          id: { in: productIds },
          storeId,
          productType: "PRODUCT",
          isActive: true,
        },
        select: { id: true },
      }),
      prisma.category.findFirst({
        where: { id: BigInt(values.categoryId), storeId, isActive: true },
        select: { id: true },
      }),
      prisma.brand.findFirst({
        where: { id: BigInt(values.brandId), storeId, isActive: true },
        select: { id: true },
      }),
      values.sku || values.barcode
        ? prisma.product.findFirst({
            where: {
              storeId,
              id: { not: bundle.productId },
              OR: [
                ...(values.sku ? [{ sku: values.sku }] : []),
                ...(values.barcode ? [{ barcode: values.barcode }] : []),
              ],
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (products.length !== productIds.length || !category || !brand) {
      return buildErrorResponse(
        "INVALID_REFERENCE",
        "Produk, kategori, atau brand tidak valid.",
        [],
      );
    }
    if (duplicateCode) {
      return buildErrorResponse(
        "DUPLICATE_CODE",
        "SKU atau barcode sudah dipakai produk lain.",
        [],
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: bundle.productId },
        data: {
          name: values.name,
          description: values.description || null,
          categoryId: BigInt(values.categoryId),
          brandId: BigInt(values.brandId),
          sku: values.sku || null,
          barcode: values.barcode || null,
          updatedBy: session.user.username,
        },
      });
      await tx.productBundle.update({
        where: { id: bundle.id },
        data: {
          sellPrice: values.sellPrice,
          updatedBy: session.user.username,
        },
      });
      await tx.productBundleItem.deleteMany({
        where: { productBundleId: bundle.id },
      });
      await tx.productBundleItem.createMany({
        data: values.items.map((item) => ({
          productBundleId: bundle.id,
          productId: BigInt(item.productId),
          quantity: item.quantity,
          updatedBy: session.user.username,
        })),
      });
    });

    return buildResponse({ id: bundle.id });
  } catch (error) {
    console.error("UPDATE_PRODUCT_BUNDLE_ERROR", error);
    return buildErrorResponse(
      "UPDATE_PRODUCT_BUNDLE_ERROR",
      "Perubahan bundle gagal disimpan.",
      [],
      500,
    );
  }
};

export const PATCH = async (req: NextRequest, { params }: RouteContext) => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);
  const { bundleId } = await params;

  if (!session || !Number.isFinite(storeId)) {
    return notAuthorizeResponse();
  }

  const body = await req.json();
  if (typeof body.isActive !== "boolean") {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Status bundle tidak valid.",
      [],
    );
  }

  const bundle = await prisma.productBundle.findFirst({
    where: { id: BigInt(bundleId), storeId },
    select: { id: true, productId: true },
  });
  if (!bundle) {
    return dataNotExistReponse();
  }

  await prisma.$transaction([
    prisma.productBundle.update({
      where: { id: bundle.id },
      data: {
        isActive: body.isActive,
        updatedBy: session.user.username,
      },
    }),
    prisma.product.update({
      where: { id: bundle.productId },
      data: {
        isActive: body.isActive,
        updatedBy: session.user.username,
      },
    }),
  ]);

  return buildResponse({ id: bundle.id, isActive: body.isActive });
};
