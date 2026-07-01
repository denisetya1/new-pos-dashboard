import { auth } from "@/auth";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { buildErrorResponse, buildResponse, dataNotExistReponse } from "@/lib/response";
import { NextRequest } from "next/server";

const serializeCategory = (category: {
  id: bigint;
  name: string;
  description: string | null;
  isActive: boolean;
  storeId: bigint | null;
}) => ({
  ...category,
  id: category.id.toString(),
  storeId: category.storeId?.toString() || null,
});

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const search = req.nextUrl.searchParams.get("search");
  let limit = Number(req.nextUrl.searchParams.get("limit"));
  let page = Number(req.nextUrl.searchParams.get("page"));

  if (isEmptyVal(limit, true)) {
    limit = 50;
  }

  if (isEmptyVal(page, true)) {
    page = 1;
  }

  const categories = await prisma.category.findManyAndCount({
    where: {
      storeId: Number(session?.user.storeId),
      isActive: true,
      ...(search !== null && search !== ""
        ? {
            name: {
              contains: search,
            },
          }
        : {}),
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      storeId: true,
      isActive: true,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return buildResponse({
    contents: categories[0].map(serializeCategory),
    totalRow: categories[1],
    page,
    limit,
  });
};

export const POST = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();

  if (name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama kategori wajib diisi!", []);
  }

  const category = await prisma.category.create({
    data: {
      name,
      description,
      storeId: Number(session?.user.storeId),
      isActive: true,
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse(serializeCategory(category));
};

export const PATCH = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();

  if (name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama kategori wajib diisi!", []);
  }

  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      storeId: Number(session?.user.storeId),
    },
  });

  if (existingCategory === null) {
    return dataNotExistReponse();
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      description,
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse(serializeCategory(category));
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);

  const existingCategory = await prisma.category.findFirst({
    where: {
      id,
      storeId: Number(session?.user.storeId),
    },
  });

  if (existingCategory === null) {
    return dataNotExistReponse();
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      isActive: false,
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse(serializeCategory(category));
};
