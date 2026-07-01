import { auth } from "@/auth";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
} from "@/lib/response";
import { NextRequest } from "next/server";

type OutletResponse = {
  id: bigint;
  name: string;
  sequence: number | null;
  storeId: bigint;
  isActive: boolean;
  isActivePOS: boolean | null;
  address: string | null;
  phone: string | null;
  printExtraInfo: string | null;
  printHeaderLine1: string | null;
  printHeaderLine2: string | null;
  printHeaderLine3: string | null;
  printHeaderLine4: string | null;
  printHeaderLine5: string | null;
};

const serializeOutlet = (outlet: OutletResponse) => ({
  ...outlet,
  id: outlet.id.toString(),
  storeId: outlet.storeId.toString(),
});

const cleanString = (value: unknown) => String(value || "").trim();

const getOutletPayload = (body: Record<string, unknown>) => {
  return {
    name: cleanString(body.name),
    phone: cleanString(body.phone),
    address: cleanString(body.address),
    isActivePOS: Boolean(body.isActivePOS),
    printHeaderLine1: cleanString(body.printHeaderLine1),
    printHeaderLine2: cleanString(body.printHeaderLine2),
    printHeaderLine3: cleanString(body.printHeaderLine3),
    printHeaderLine4: cleanString(body.printHeaderLine4),
    printHeaderLine5: cleanString(body.printHeaderLine5),
    printExtraInfo: cleanString(body.printExtraInfo),
  };
};

const outletSelect = {
  id: true,
  name: true,
  sequence: true,
  storeId: true,
  isActive: true,
  isActivePOS: true,
  address: true,
  phone: true,
  printExtraInfo: true,
  printHeaderLine1: true,
  printHeaderLine2: true,
  printHeaderLine3: true,
  printHeaderLine4: true,
  printHeaderLine5: true,
};

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

  const outlets = await prisma.outlet.findManyAndCount({
    where: {
      storeId: Number(session?.user.storeId),
      isActive: true,
      ...(search !== null && search !== ""
        ? {
            OR: [
              {
                name: {
                  contains: search,
                },
              },
              { phone: { contains: search } },
              { address: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ sequence: "asc" }, { name: "asc" }],
    select: outletSelect,
    skip: (page - 1) * limit,
    take: limit,
  });

  return buildResponse({
    contents: outlets[0].map(serializeOutlet),
    totalRow: outlets[1],
    page,
    limit,
  });
};

export const POST = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const payload = getOutletPayload(body);

  if (payload.name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama outlet wajib diisi!", []);
  }

  const outletCount = await prisma.outlet.count({
    where: {
      storeId: Number(session?.user.storeId),
      isActive: true,
    },
  });

  const outlet = await prisma.outlet.create({
    data: {
      ...payload,
      sequence: outletCount + 1,
      storeId: Number(session?.user.storeId),
      isActive: true,
      updatedBy: String(session?.user.username),
    },
    select: outletSelect,
  });

  return buildResponse(serializeOutlet(outlet));
};

export const PATCH = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);
  const payload = getOutletPayload(body);

  if (payload.name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama outlet wajib diisi!", []);
  }

  const existingOutlet = await prisma.outlet.findFirst({
    where: {
      id,
      storeId: Number(session?.user.storeId),
    },
  });

  if (existingOutlet === null) {
    return dataNotExistReponse();
  }

  const outlet = await prisma.outlet.update({
    where: {
      id,
    },
    data: {
      ...payload,
      updatedBy: String(session?.user.username),
    },
    select: outletSelect,
  });

  return buildResponse(serializeOutlet(outlet));
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);

  const existingOutlet = await prisma.outlet.findFirst({
    where: {
      id,
      storeId: Number(session?.user.storeId),
    },
  });

  if (existingOutlet === null) {
    return dataNotExistReponse();
  }

  const outlet = await prisma.outlet.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      updatedBy: String(session?.user.username),
    },
    select: outletSelect,
  });

  return buildResponse(serializeOutlet(outlet));
};
