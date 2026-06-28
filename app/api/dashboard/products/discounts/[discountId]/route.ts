import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildErrorResponse, buildResponse } from "@/lib/response";
import { NextRequest } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ discountId: string }> },
) => {
  const session = await auth();
  const { discountId } = await params;

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

    const newDiscount = await prisma.discount.update({
      where: {
        id: Number(discountId),
      },
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
    console.error("UPDATE_DISCOUNT_ERROR:", error);
    return buildErrorResponse(
      "UPDATE_DISCOUNT_ERROR",
      error.message || "Gagal membuat diskon",
      [],
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ discountId: string }> },
) => {
  const session = await auth();
  const { discountId } = await params;

  try {
    const body = await req.json();
    const { isActive } = body;

    const newDiscount = await prisma.discount.update({
      where: {
        id: Number(discountId),
      },
      data: {
        isActive,
        updatedAt: new Date(),
        updatedBy: session?.user.username,
      },
    });

    return buildResponse(newDiscount);
  } catch (error: any) {
    console.error("UPDATE_DISCOUNT_ERROR:", error);
    return buildErrorResponse(
      "UPDATE_DISCOUNT_ERROR",
      error.message || "Gagal membuat diskon",
      [],
    );
  }
};
