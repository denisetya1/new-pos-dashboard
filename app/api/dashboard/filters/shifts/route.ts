import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async () => {
  const session = await auth();
  const shifts = await prisma.shift.findMany({
    where: {
      outletId: Number(session?.user.outletId),
      isActive: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return buildResponse(shifts);
};
