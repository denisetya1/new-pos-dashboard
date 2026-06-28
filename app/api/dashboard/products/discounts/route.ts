import { auth } from "@/auth";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { buildErrorResponse, buildResponse } from "@/lib/response";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const search = req.nextUrl.searchParams.get("search") || null;
  let limit = Number(req.nextUrl.searchParams.get("limit"));
  let page = Number(req.nextUrl.searchParams.get("page"));

  if (isEmptyVal(limit, true)) {
    limit = 50;
  }

  if (isEmptyVal(page, true)) {
    page = 1;
  }

  const skip = (page - 1) * limit;

  const discounts = await prisma.discount.findManyAndCount({
    where: {
      outletId: Number(session?.user?.outletId),
      ...(search
        ? {
            OR: [
              {
                name: {
                  contains: search, // Sekarang aman karena 'search' dijamin string
                },
              },
              {
                code: {
                  contains: search, // Sekarang aman karena 'search' dijamin string
                },
              },
            ],
          }
        : {}),
    },
    take: limit,
    skip: skip,
    orderBy: {
      createdAt: "desc",
    },
  });

  const resDisounts = {
    contents: discounts[0],
    totalRow: discounts[1],
    page,
    limit,
  };

  return buildResponse(resDisounts);
};

export async function POST(req: NextRequest) {
  const session = await auth();

  try {
    const body = await req.json();
    const {
      name,
      code,
      discountType,
      discountValue,
      minTransaction,
      maxAmount,
      startDate,
      endDate,
      recommendation,
    } = body;

    const newDiscount = await prisma.discount.create({
      data: {
        name,
        code: code || null,
        discountType,
        discountValue: Number(discountValue),
        minTransaction: Number(minTransaction || 0),
        maxAmount: Number(maxAmount || 0),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        recommendation: recommendation ?? true,
        outletId: Number(session?.user.outletId),
        updatedAt: new Date(),
        updatedBy: session?.user.username,
      },
    });

    return buildResponse(newDiscount);
  } catch (error: any) {
    console.error("CREATE_DISCOUNT_ERROR:", error);
    return buildErrorResponse(
      "CREATE_DISCOUNT_ERROR",
      error.message || "Gagal membuat diskon",
      [],
    );
  }
}
