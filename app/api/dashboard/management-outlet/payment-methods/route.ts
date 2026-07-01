import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
} from "@/lib/response";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const outletId = Number(req.nextUrl.searchParams.get("outletId"));

  if (!outletId) {
    return buildErrorResponse("VALIDATION_ERROR", "Outlet wajib dipilih!", []);
  }

  const outlet = await prisma.outlet.findFirst({
    where: {
      id: outletId,
      storeId: Number(session?.user.storeId),
      isActive: true,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (outlet === null) {
    return dataNotExistReponse();
  }

  const paymentMethods = await prisma.paymentMethod.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      displayName: "asc",
    },
    select: {
      id: true,
      name: true,
      displayName: true,
      description: true,
      OutletPaymentMethods: {
        where: {
          storeId: Number(session?.user.storeId),
          outletId,
        },
        select: {
          id: true,
          isActive: true,
        },
        take: 1,
      },
    },
  });

  return buildResponse({
    outlet: {
      ...outlet,
      id: outlet.id.toString(),
    },
    contents: paymentMethods.map((paymentMethod) => {
      const outletPaymentMethod = paymentMethod.OutletPaymentMethods[0] || null;

      return {
        id: paymentMethod.id.toString(),
        name: paymentMethod.name,
        displayName: paymentMethod.displayName,
        description: paymentMethod.description,
        outletPaymentMethodId: outletPaymentMethod?.id.toString() || null,
        isActive: outletPaymentMethod?.isActive || false,
      };
    }),
  });
};

export const PATCH = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const outletId = Number(body.outletId);
  const paymentMethodId = Number(body.paymentMethodId);
  const isActive = Boolean(body.isActive);

  if (!outletId || !paymentMethodId) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Outlet dan metode pembayaran wajib dipilih!",
      [],
    );
  }

  const outlet = await prisma.outlet.findFirst({
    where: {
      id: outletId,
      storeId: Number(session?.user.storeId),
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (outlet === null) {
    return dataNotExistReponse();
  }

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      id: paymentMethodId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });

  if (paymentMethod === null) {
    return dataNotExistReponse();
  }

  const outletPaymentMethod = await prisma.outletPaymentMethod.upsert({
    where: {
      storeId_outletId_paymentMethodId: {
        storeId: Number(session?.user.storeId),
        outletId,
        paymentMethodId,
      },
    },
    update: {
      isActive,
      updatedBy: String(session?.user.username),
    },
    create: {
      storeId: Number(session?.user.storeId),
      outletId,
      paymentMethodId,
      isActive,
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse({
    ...outletPaymentMethod,
    id: outletPaymentMethod.id.toString(),
    storeId: outletPaymentMethod.storeId?.toString() || null,
    outletId: outletPaymentMethod.outletId?.toString() || null,
  });
};
