import { auth } from "@/auth";
import { DirectionEnum } from "@/generated/prisma/enums";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
} from "@/lib/response";
import { NextRequest } from "next/server";

const serializeMoveType = (moveType: {
  id: bigint;
  name: string;
  direction: DirectionEnum;
  isActive: boolean;
  storeId: bigint | null;
}) => ({
  ...moveType,
  id: moveType.id.toString(),
  storeId: moveType.storeId?.toString() || null,
  editable: Number(moveType.storeId) !== 0,
});

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const search = req.nextUrl.searchParams.get("search");
  const direction = req.nextUrl.searchParams.get("direction");
  let limit = Number(req.nextUrl.searchParams.get("limit"));
  let page = Number(req.nextUrl.searchParams.get("page"));

  if (isEmptyVal(limit, true)) {
    limit = 50;
  }

  if (isEmptyVal(page, true)) {
    page = 1;
  }

  const moveTypes = await prisma.moveType.findManyAndCount({
    where: {
      OR: [{ storeId: Number(session?.user.storeId) }, { storeId: 0 }],
      isActive: true,
      ...(direction === "IN" || direction === "OUT"
        ? { direction: direction as DirectionEnum }
        : {}),
      ...(search !== null && search !== ""
        ? {
            name: {
              contains: search,
            },
          }
        : {}),
    },
    orderBy: [{ direction: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      direction: true,
      storeId: true,
      isActive: true,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return buildResponse({
    contents: moveTypes[0].map(serializeMoveType),
    totalRow: moveTypes[1],
    page,
    limit,
  });
};

export const POST = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const name = String(body.name || "").trim();
  const direction = body.direction;

  if (name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama jenis wajib diisi!", []);
  }

  if (direction !== "IN" && direction !== "OUT") {
    return buildErrorResponse("VALIDATION_ERROR", "Arah stok wajib dipilih!", []);
  }

  const moveType = await prisma.moveType.create({
    data: {
      name,
      direction,
      storeId: Number(session?.user.storeId),
      isActive: true,
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse(serializeMoveType(moveType));
};

export const PATCH = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);
  const name = String(body.name || "").trim();
  const direction = body.direction;

  if (name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama jenis wajib diisi!", []);
  }

  if (direction !== "IN" && direction !== "OUT") {
    return buildErrorResponse("VALIDATION_ERROR", "Arah stok wajib dipilih!", []);
  }

  const existingMoveType = await prisma.moveType.findFirst({
    where: {
      id,
      OR: [{ storeId: Number(session?.user.storeId) }, { storeId: 0 }],
    },
  });

  if (existingMoveType === null) {
    return dataNotExistReponse();
  }

  if (Number(existingMoveType.storeId) === 0) {
    return buildErrorResponse(
      "DEFAULT_DATA_LOCKED",
      "Jenis perpindahan stok bawaan sistem tidak bisa diedit!",
      [],
      403,
    );
  }

  const moveType = await prisma.moveType.update({
    where: { id },
    data: {
      name,
      direction,
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse(serializeMoveType(moveType));
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);

  const existingMoveType = await prisma.moveType.findFirst({
    where: {
      id,
      OR: [{ storeId: Number(session?.user.storeId) }, { storeId: 0 }],
    },
  });

  if (existingMoveType === null) {
    return dataNotExistReponse();
  }

  if (Number(existingMoveType.storeId) === 0) {
    return buildErrorResponse(
      "DEFAULT_DATA_LOCKED",
      "Jenis perpindahan stok bawaan sistem tidak bisa dihapus!",
      [],
      403,
    );
  }

  const moveType = await prisma.moveType.update({
    where: { id },
    data: {
      isActive: false,
      updatedBy: String(session?.user.username),
    },
  });

  return buildResponse(serializeMoveType(moveType));
};
