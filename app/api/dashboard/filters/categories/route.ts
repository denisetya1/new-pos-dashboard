import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async () => {
  const categories = await prisma.category.findMany({
    where: {
      storeId: 1,
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

  return buildResponse(categories);
};
