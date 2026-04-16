import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (req: NextRequest) => {
  const outlets = await prisma.outlet.findMany({
    where: {
      storeId: 1,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return NextResponse.json(outlets);
};
