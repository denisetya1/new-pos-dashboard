import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  notAuthorizeResponse,
} from "@/lib/response";
import { productBundleSchema } from "@/schemas/productBundleSchema";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);
  const outletId = Number(session?.user.outletId);

  if (!session || !Number.isFinite(storeId) || !Number.isFinite(outletId)) {
    return notAuthorizeResponse();
  }

  const search = String(req.nextUrl.searchParams.get("search") || "").trim();
  const bundles = await prisma.productBundle.findManyAndCount({
    where: {
      storeId,
      ...(search
        ? {
            product: {
              OR: [
                { name: { contains: search } },
                { sku: { contains: search } },
                { barcode: { contains: search } },
              ],
            },
          }
        : {}),
    },
    select: {
      id: true,
      productId: true,
      sellPrice: true,
      isActive: true,
      createdAt: true,
      product: {
        select: {
          id: true,
          name: true,
          description: true,
          barcode: true,
          sku: true,
          categoryId: true,
          brandId: true,
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
        },
      },
      items: {
        where: { deletedAt: null },
        orderBy: { id: "asc" },
        select: {
          id: true,
          productId: true,
          quantity: true,
          product: {
            select: {
              id: true,
              name: true,
              barcode: true,
              sku: true,
              stocks: {
                where: { outletId, isActive: true },
                select: {
                  quantity: true,
                  sellPrice: true,
                  markupPercentage: true,
                  discountPercentage: true,
                },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return buildResponse({ contents: bundles[0], totalRow: bundles[1] });
};

export const POST = async (req: NextRequest) => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);

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
              OR: [
                ...(values.sku ? [{ sku: values.sku }] : []),
                ...(values.barcode ? [{ barcode: values.barcode }] : []),
              ],
            },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (products.length !== productIds.length) {
      return buildErrorResponse(
        "INVALID_PRODUCTS",
        "Ada produk yang tidak aktif atau bukan milik store ini.",
        [],
      );
    }
    if (!category || !brand) {
      return buildErrorResponse(
        "INVALID_REFERENCE",
        "Kategori atau brand tidak valid.",
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

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: values.name,
          description: values.description || null,
          categoryId: BigInt(values.categoryId),
          brandId: BigInt(values.brandId),
          sku: values.sku || null,
          barcode: values.barcode || null,
          storeId,
          productType: "BUNDLE",
          isActive: true,
          updatedBy: session.user.username,
        },
      });

      return tx.productBundle.create({
        data: {
          storeId,
          productId: product.id,
          sellPrice: values.sellPrice,
          isActive: true,
          updatedBy: session.user.username,
          items: {
            create: values.items.map((item) => ({
              productId: BigInt(item.productId),
              quantity: item.quantity,
              updatedBy: session.user.username,
            })),
          },
        },
        select: { id: true },
      });
    });

    return buildResponse(result);
  } catch (error) {
    console.error("CREATE_PRODUCT_BUNDLE_ERROR", error);
    return buildErrorResponse(
      "CREATE_PRODUCT_BUNDLE_ERROR",
      "Bundle gagal disimpan.",
      [],
      500,
    );
  }
};
