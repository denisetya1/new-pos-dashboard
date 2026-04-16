import { prisma } from "@/lib/prisma";
import { buildResponse } from "@/lib/response";
import { NextResponse } from "next/server";

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
  const body = await req.json();
  const { productId } = await params;

  const product = await prisma.product.update({
    where: {
      id: Number(productId),
    },
    data: {
      ...body,
    },
  });

  return buildResponse(product);
};

export const DELETE = async (
  req: Request,
  { params }: { params: Promise<{ productId: string }> },
) => {
  const { productId } = await params;

  const product = await prisma.product.delete({
    where: {
      id: Number(productId),
    },
  });

  return buildResponse(product);
};
