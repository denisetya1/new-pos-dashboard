import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async () => {
  const session = await auth();

  const brands = await prisma.brand.findMany({
    where: {
      storeId: Number(session?.user?.storeId),
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

  return buildResponse(brands);
};
