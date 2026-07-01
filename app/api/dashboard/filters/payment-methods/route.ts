import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async () => {
  const session = await auth();
  const paymentMethods = await prisma.outletPaymentMethod.findMany({
    where: {
      outletId: Number(session?.user.outletId),
      isActive: true,
    },
    select: {
      id: true,
      paymentMethod: {
        select: {
          id: true,
          name: true,
          displayName: true,
        },
      },
    },
  });

  return buildResponse(paymentMethods);
};
