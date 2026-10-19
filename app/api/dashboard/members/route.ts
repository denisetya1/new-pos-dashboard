import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
  notAuthorizeResponse,
} from "@/lib/response";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";

const memberSelect = {
  id: true,
  memberCode: true,
  name: true,
  phone: true,
  email: true,
  birthDate: true,
  address: true,
  points: true,
  isActive: true,
  createdAt: true,
};

type MemberResponse = {
  id: bigint;
  memberCode: string;
  name: string;
  phone: string;
  email: string | null;
  birthDate: Date | null;
  address: string | null;
  points: number;
  isActive: boolean;
  createdAt: Date;
};

const serializeMember = (member: MemberResponse) => ({
  ...member,
  id: member.id.toString(),
});

const getStoreContext = async () => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);

  if (!session || !Number.isFinite(storeId) || storeId <= 0) {
    return null;
  }

  return {
    storeId,
    username: String(session.user.username || ""),
  };
};

const parseMemberPayload = (body: Record<string, unknown>) => {
  const name = String(body.name || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const address = String(body.address || "").trim();
  const birthDateValue = String(body.birthDate || "").trim();
  const birthDate = birthDateValue
    ? new Date(`${birthDateValue}T00:00:00.000Z`)
    : null;

  return {
    name,
    phone,
    email: email || null,
    address: address || null,
    birthDate:
      birthDate && !Number.isNaN(birthDate.getTime()) ? birthDate : null,
    birthDateProvided: birthDateValue !== "",
  };
};

const validateMemberPayload = (
  member: ReturnType<typeof parseMemberPayload>,
) => {
  if (member.name === "") {
    return "Nama member wajib diisi.";
  }

  if (member.phone === "") {
    return "Nomor telepon member wajib diisi.";
  }

  if (member.phone.length < 8 || member.phone.length > 30) {
    return "Nomor telepon harus terdiri dari 8 sampai 30 karakter.";
  }

  if (member.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
    return "Format email tidak valid.";
  }

  if (member.birthDateProvided && member.birthDate === null) {
    return "Tanggal lahir tidak valid.";
  }

  if (member.birthDate && member.birthDate > new Date()) {
    return "Tanggal lahir tidak boleh melewati hari ini.";
  }

  return null;
};

export const GET = async (req: NextRequest) => {
  const context = await getStoreContext();

  if (!context) {
    return notAuthorizeResponse();
  }

  const search = req.nextUrl.searchParams.get("search")?.trim() || "";
  const requestedPage = Number(req.nextUrl.searchParams.get("page") || "1");
  const requestedLimit = Number(req.nextUrl.searchParams.get("limit") || "50");
  const page = Number.isFinite(requestedPage)
    ? Math.max(1, Math.floor(requestedPage))
    : 1;
  const limit = Number.isFinite(requestedLimit)
    ? Math.min(100, Math.max(1, Math.floor(requestedLimit)))
    : 50;

  const [members, totalRow] = await prisma.member.findManyAndCount({
    where: {
      storeId: context.storeId,
      isActive: true,
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { memberCode: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: [{ name: "asc" }, { id: "asc" }],
    select: memberSelect,
    skip: (page - 1) * limit,
    take: limit,
  });

  return buildResponse({
    contents: members.map(serializeMember),
    totalRow,
    page,
    limit,
  });
};

export const POST = async (req: Request) => {
  const context = await getStoreContext();

  if (!context) {
    return notAuthorizeResponse();
  }

  const body = await req.json();
  const memberPayload = parseMemberPayload(body);
  const validationError = validateMemberPayload(memberPayload);

  if (validationError) {
    return buildErrorResponse("VALIDATION_ERROR", validationError, []);
  }

  const duplicatePhone = await prisma.member.findFirst({
    where: {
      storeId: context.storeId,
      phone: memberPayload.phone,
      isActive: true,
    },
    select: { id: true },
  });

  if (duplicatePhone) {
    return buildErrorResponse(
      "DUPLICATE_PHONE",
      "Nomor telepon sudah digunakan member lain.",
      [],
    );
  }

  const member = await prisma.member.create({
    data: {
      memberCode: `MBR-${randomUUID().slice(0, 8).toUpperCase()}`,
      storeId: context.storeId,
      name: memberPayload.name,
      phone: memberPayload.phone,
      email: memberPayload.email,
      birthDate: memberPayload.birthDate,
      address: memberPayload.address,
      points: 0,
      isActive: true,
      updatedBy: context.username,
    },
    select: memberSelect,
  });

  return buildResponse(serializeMember(member));
};

export const PATCH = async (req: Request) => {
  const context = await getStoreContext();

  if (!context) {
    return notAuthorizeResponse();
  }

  const body = await req.json();
  const id = Number(body.id);
  const memberPayload = parseMemberPayload(body);
  const validationError = validateMemberPayload(memberPayload);

  if (!Number.isFinite(id) || id <= 0) {
    return buildErrorResponse("VALIDATION_ERROR", "Member tidak valid.", []);
  }

  if (validationError) {
    return buildErrorResponse("VALIDATION_ERROR", validationError, []);
  }

  const [existingMember, duplicatePhone] = await Promise.all([
    prisma.member.findFirst({
      where: { id, storeId: context.storeId, isActive: true },
      select: { id: true },
    }),
    prisma.member.findFirst({
      where: {
        storeId: context.storeId,
        phone: memberPayload.phone,
        isActive: true,
        NOT: { id },
      },
      select: { id: true },
    }),
  ]);

  if (!existingMember) {
    return dataNotExistReponse();
  }

  if (duplicatePhone) {
    return buildErrorResponse(
      "DUPLICATE_PHONE",
      "Nomor telepon sudah digunakan member lain.",
      [],
    );
  }

  const member = await prisma.member.update({
    where: { id },
    data: {
      name: memberPayload.name,
      phone: memberPayload.phone,
      email: memberPayload.email,
      birthDate: memberPayload.birthDate,
      address: memberPayload.address,
      updatedBy: context.username,
    },
    select: memberSelect,
  });

  return buildResponse(serializeMember(member));
};

export const DELETE = async (req: Request) => {
  const context = await getStoreContext();

  if (!context) {
    return notAuthorizeResponse();
  }

  const body = await req.json();
  const id = Number(body.id);

  const existingMember = await prisma.member.findFirst({
    where: { id, storeId: context.storeId, isActive: true },
    select: { id: true },
  });

  if (!existingMember) {
    return dataNotExistReponse();
  }

  const member = await prisma.member.update({
    where: { id },
    data: {
      isActive: false,
      deletedAt: new Date(),
      updatedBy: context.username,
    },
    select: memberSelect,
  });

  return buildResponse(serializeMember(member));
};
