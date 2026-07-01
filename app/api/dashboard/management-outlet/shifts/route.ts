import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
} from "@/lib/response";
import { NextRequest } from "next/server";

type ShiftResponse = {
  id: bigint;
  outletId: bigint;
  name: string;
  sort: number;
  workingHours: string | null;
  isActive: boolean;
  createdAt: Date;
};

const shiftSelect = {
  id: true,
  outletId: true,
  name: true,
  sort: true,
  workingHours: true,
  isActive: true,
  createdAt: true,
};

const serializeShift = (shift: ShiftResponse) => ({
  ...shift,
  id: shift.id.toString(),
  outletId: shift.outletId.toString(),
});

const cleanString = (value: unknown) => String(value || "").trim();

const ensureOutlet = async (outletId: number, storeId: number) => {
  return prisma.outlet.findFirst({
    where: {
      id: outletId,
      storeId,
      isActive: true,
    },
    select: {
      id: true,
    },
  });
};

export const GET = async (req: NextRequest) => {
  const session = await auth();
  const outletId = Number(req.nextUrl.searchParams.get("outletId"));

  if (!outletId) {
    return buildErrorResponse("VALIDATION_ERROR", "Outlet wajib dipilih!", []);
  }

  const outlet = await ensureOutlet(outletId, Number(session?.user.storeId));

  if (outlet === null) {
    return dataNotExistReponse();
  }

  const shifts = await prisma.shift.findMany({
    where: {
      outletId,
    },
    orderBy: [{ sort: "asc" }, { name: "asc" }],
    select: shiftSelect,
  });

  return buildResponse({
    contents: shifts.map(serializeShift),
  });
};

export const POST = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const outletId = Number(body.outletId);
  const name = cleanString(body.name);
  const workingHours = cleanString(body.workingHours);

  if (!outletId) {
    return buildErrorResponse("VALIDATION_ERROR", "Outlet wajib dipilih!", []);
  }

  if (name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama shift wajib diisi!", []);
  }

  const outlet = await ensureOutlet(outletId, Number(session?.user.storeId));

  if (outlet === null) {
    return dataNotExistReponse();
  }

  const shiftCount = await prisma.shift.count({
    where: {
      outletId,
    },
  });

  const shift = await prisma.shift.create({
    data: {
      outletId,
      name,
      workingHours,
      sort: shiftCount + 1,
      isActive: true,
      updatedBy: String(session?.user.username),
    },
    select: shiftSelect,
  });

  return buildResponse(serializeShift(shift));
};

export const PATCH = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);
  const outletId = Number(body.outletId);
  const name = cleanString(body.name);
  const workingHours = cleanString(body.workingHours);

  if (!id || !outletId) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Shift dan outlet wajib dipilih!",
      [],
    );
  }

  if (name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama shift wajib diisi!", []);
  }

  const existingShift = await prisma.shift.findFirst({
    where: {
      id,
      outletId,
      outlet: {
        storeId: Number(session?.user.storeId),
      },
    },
  });

  if (existingShift === null) {
    return dataNotExistReponse();
  }

  const shift = await prisma.shift.update({
    where: {
      id,
    },
    data: {
      name,
      workingHours,
      updatedBy: String(session?.user.username),
    },
    select: shiftSelect,
  });

  return buildResponse(serializeShift(shift));
};

export const PUT = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);
  const isActive = Boolean(body.isActive);

  const existingShift = await prisma.shift.findFirst({
    where: {
      id,
      outlet: {
        storeId: Number(session?.user.storeId),
      },
    },
  });

  if (existingShift === null) {
    return dataNotExistReponse();
  }

  const shift = await prisma.shift.update({
    where: {
      id,
    },
    data: {
      isActive,
      updatedBy: String(session?.user.username),
    },
    select: shiftSelect,
  });

  return buildResponse(serializeShift(shift));
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);

  const existingShift = await prisma.shift.findFirst({
    where: {
      id,
      outlet: {
        storeId: Number(session?.user.storeId),
      },
    },
  });

  if (existingShift === null) {
    return dataNotExistReponse();
  }

  const shift = await prisma.shift.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
      updatedBy: String(session?.user.username),
    },
    select: shiftSelect,
  });

  return buildResponse(serializeShift(shift));
};
