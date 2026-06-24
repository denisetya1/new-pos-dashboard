import { auth } from "@/auth";
import { DirectionEnum } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  const searchParams = req.nextUrl.searchParams;
  const session = await auth();
  const direction = searchParams.get("direction") || "IN";

  const categories = await prisma.moveType.findMany({
    where: {
      OR: [
        {
          storeId: Number(session?.user.storeId),
        },
        {
          storeId: 0,
        },
      ],
      direction: direction as DirectionEnum,
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
