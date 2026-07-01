import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ outletId: string }> },
) => {
  const { outletId } = await params;
  const session = await auth();

  const outlet = await prisma.outlet.findFirst({
    where: {
      id: Number(outletId),
      storeId: Number(session?.user.storeId),
    },
  });

  return buildResponse(outlet);
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ outletId: string }> },
) => {
  const body = await req.json();
  const { outletId } = await params;

  const outlet = await prisma.outlet.update({
    where: {
      id: Number(outletId),
    },
    data: {
      ...body,
    },
  });

  return buildResponse(outlet);
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ outletId: string }> },
) => {
  const { outletId } = await params;

  const outlet = await prisma.outlet.delete({
    where: {
      id: Number(outletId),
    },
  });

  return buildResponse(outlet);
};
