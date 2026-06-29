import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const { productId } = await params;

  const product = await prisma.product.findFirst({
    where: {
      id: Number(productId),
    },
  });

  return buildResponse(product);
};

export const PUT = async (
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const session = await auth();
  const body = await req.json();
  const { productId } = await params;

  const product = await prisma.product.update({
    where: {
      id: Number(productId),
    },
    data: {
      ...body,
      updatedAt: new Date(),
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse(product);
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const session = await auth();
  const { productId } = await params;

  const product = await prisma.product.update({
    where: {
      id: Number(productId),
    },
    data: {
      deletedAt: new Date(),
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse(product);
};
