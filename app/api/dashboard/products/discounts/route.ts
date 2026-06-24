import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async () => {
  const session = await auth();

  const discounts = await prisma.discount.findMany({
    where: {
      outletId: Number(session?.user?.outletId),
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return buildResponse(discounts);
};
