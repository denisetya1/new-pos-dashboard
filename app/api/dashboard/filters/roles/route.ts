import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async () => {
  const session = await auth();

  const roles = await prisma.role.findMany({
    where: {
      OR: [
        { storeId: Number(session?.user.storeId) },
        { storeId: 0 },
        { storeId: null },
      ],
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

  return buildResponse(
    roles.map((role) => ({
      ...role,
      id: role.id.toString(),
    })),
  );
};
