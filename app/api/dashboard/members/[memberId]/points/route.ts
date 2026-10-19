import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
  notAuthorizeResponse,
} from "@/lib/response";
import { NextRequest } from "next/server";

const getContext = async () => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);
  const outletId = Number(session?.user.outletId);

  if (!session || !Number.isFinite(storeId) || storeId <= 0) {
    return null;
  }

  return {
    storeId,
    outletId: Number.isFinite(outletId) && outletId > 0 ? outletId : null,
    username: String(session.user.username || ""),
  };
};

const serializePointTransaction = (transaction: {
  id: bigint;
  type: string;
  points: number;
  balanceAfter: number;
  reason: string;
  createdAt: Date;
  updatedBy: string | null;
  outlet: { id: bigint; name: string } | null;
}) => ({
  ...transaction,
  id: transaction.id.toString(),
  outlet: transaction.outlet
    ? {
        ...transaction.outlet,
        id: transaction.outlet.id.toString(),
      }
    : null,
});

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> },
) => {
  const context = await getContext();

  if (!context) {
    return notAuthorizeResponse();
  }

  const { memberId } = await params;
  const id = Number(memberId);
  const requestedPage = Number(req.nextUrl.searchParams.get("page") || "1");
  const requestedLimit = Number(req.nextUrl.searchParams.get("limit") || "20");
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, Math.floor(requestedLimit)))
    : 20;

  const member = await prisma.member.findFirst({
    where: { id, storeId: context.storeId, isActive: true },
    select: { id: true, memberCode: true, name: true, points: true },
  });

  if (!member) {
    return dataNotExistReponse();
  }

  const [transactions, totalRow] =
    await prisma.loyaltyPointTransaction.findManyAndCount({
      where: {
        memberId: id,
        storeId: context.storeId,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        type: true,
        points: true,
        balanceAfter: true,
        reason: true,
        createdAt: true,
        updatedBy: true,
        outlet: {
          select: { id: true, name: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
    });

  return buildResponse({
    member: {
      ...member,
      id: member.id.toString(),
    },
    contents: transactions.map(serializePointTransaction),
    totalRow,
    page,
    limit,
  });
};

export const POST = async (
  req: Request,
  { params }: { params: Promise<{ memberId: string }> },
) => {
  const context = await getContext();

  if (!context) {
    return notAuthorizeResponse();
  }

  const { memberId } = await params;
  const id = Number(memberId);
  const body = await req.json();
  const type = String(body.type || "").toUpperCase();
  const amount = Number(body.amount);
  const reason = String(body.reason || "").trim();

  if (type !== "ADD" && type !== "DEDUCT") {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Jenis penyesuaian poin tidak valid.",
      [],
    );
  }

  if (!Number.isInteger(amount) || amount <= 0 || amount > 1_000_000_000) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Jumlah poin harus berupa angka bulat lebih dari 0.",
      [],
    );
  }

  if (reason.length < 3 || reason.length > 255) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Alasan wajib diisi antara 3 sampai 255 karakter.",
      [],
    );
  }

  const existingMember = await prisma.member.findFirst({
    where: { id, storeId: context.storeId, isActive: true },
    select: { id: true },
  });

  if (!existingMember) {
    return dataNotExistReponse();
  }

  const result = await prisma.$transaction(async (tx) => {
    if (type === "DEDUCT") {
      const deduction = await tx.member.updateMany({
        where: {
          id,
          storeId: context.storeId,
          isActive: true,
          deletedAt: null,
          points: { gte: amount },
        },
        data: {
          points: { decrement: amount },
          updatedBy: context.username,
        },
      });

      if (deduction.count === 0) {
        throw new Error("INSUFFICIENT_POINTS");
      }
    } else {
      await tx.member.update({
        where: { id },
        data: {
          points: { increment: amount },
          updatedBy: context.username,
        },
      });
    }

    const member = await tx.member.findFirstOrThrow({
      where: {
        id,
        storeId: context.storeId,
        isActive: true,
        deletedAt: null,
      },
      select: { id: true, points: true },
    });

    const transaction = await tx.loyaltyPointTransaction.create({
      data: {
        memberId: id,
        storeId: context.storeId,
        outletId: context.outletId,
        type,
        points: type === "ADD" ? amount : -amount,
        balanceAfter: member.points,
        reason,
        referenceType: "MANUAL_ADJUSTMENT",
        updatedBy: context.username,
      },
      select: {
        id: true,
        type: true,
        points: true,
        balanceAfter: true,
        reason: true,
        createdAt: true,
        updatedBy: true,
        outlet: {
          select: { id: true, name: true },
        },
      },
    });

    return {
      balance: member.points,
      transaction: serializePointTransaction(transaction),
    };
  }).catch((error: unknown) => {
    if (error instanceof Error && error.message === "INSUFFICIENT_POINTS") {
      return null;
    }

    throw error;
  });

  if (!result) {
    return buildErrorResponse(
      "INSUFFICIENT_POINTS",
      "Saldo poin member tidak mencukupi.",
      [],
    );
  }

  return buildResponse(result);
};
