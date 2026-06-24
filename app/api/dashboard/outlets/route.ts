import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async () => {
  const session = await auth();

  let outletIds: bigint[] = [];
  if (session && session?.user?.isSubAccount) {
    const userOutlets = await prisma.userOutlet.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
    });

    if (userOutlets.length > 0) {
      outletIds = userOutlets.flatMap((uo) => uo.outletId);
    }
  }

  const outlet = await prisma.outlet.findMany({
    where: {
      storeId: Number(session?.user?.storeId),
      isActive: true,
      ...(outletIds.length > 0
        ? {
            id: {
              in: outletIds,
            },
          }
        : ""),
    },
  });

  return buildResponse(outlet);
};
