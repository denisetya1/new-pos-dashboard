import { auth } from "@/auth";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import { buildErrorResponse, buildResponse } from "@/lib/response";
import { NextRequest } from "next/server";

type RoleResponse = {
  id: bigint;
  name: string;
  storeId: bigint | null;
  isActive: boolean;
};

const serializeRole = (role: RoleResponse) => ({
  ...role,
  id: role.id.toString(),
  storeId: role.storeId?.toString() || null,
  editable: Number(role.storeId) !== 0 && role.storeId !== null,
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

  const roles = await prisma.role.findManyAndCount({
    where: {
      OR: [
        { storeId: Number(session?.user.storeId) },
        { storeId: 0 },
        { storeId: null },
      ],
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
      storeId: true,
      isActive: true,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return buildResponse({
    contents: roles[0].map(serializeRole),
    totalRow: roles[1],
    page,
    limit,
  });
};

export const POST = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const name = String(body.name || "").trim();

  if (name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama role wajib diisi!", []);
  }

  const existingRole = await prisma.role.findFirst({
    where: {
      name,
      storeId: Number(session?.user.storeId),
    },
  });

  if (existingRole !== null) {
    return buildErrorResponse(
      "ROLE_EXISTS",
      "Role dengan nama tersebut sudah ada!",
      [],
      409,
    );
  }

  const role = await prisma.role.create({
    data: {
      name,
      storeId: Number(session?.user.storeId),
      roles: {},
      isActive: true,
      updatedBy: String(session?.user.username),
    },
    select: {
      id: true,
      name: true,
      storeId: true,
      isActive: true,
    },
  });

  return buildResponse(serializeRole(role));
};
