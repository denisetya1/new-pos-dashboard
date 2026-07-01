import { auth } from "@/auth";
import { isEmptyVal } from "@/lib/functions";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
} from "@/lib/response";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";

type SubAccountResponse = {
  id: string;
  name: string;
  username: string;
  phone: string | null;
  storeId: bigint | null;
  isActive: boolean;
  isSubAccount: boolean | null;
  createdAt: Date;
};

const serializeSubAccount = (user: SubAccountResponse) => ({
  ...user,
  storeId: user.storeId?.toString() || null,
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

  const subAccounts = await prisma.user.findManyAndCount({
    where: {
      storeId: Number(session?.user.storeId),
      isSubAccount: true,
      ...(search !== null && search !== ""
        ? {
            OR: [
              {
                name: {
                  contains: search,
                },
              },
              {
                username: {
                  contains: search,
                },
              },
              {
                phone: {
                  contains: search,
                },
              },
            ],
          }
        : {}),
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      storeId: true,
      isActive: true,
      isSubAccount: true,
      createdAt: true,
    },
    skip: (page - 1) * limit,
    take: limit,
  });

  return buildResponse({
    contents: subAccounts[0].map(serializeSubAccount),
    totalRow: subAccounts[1],
    page,
    limit,
  });
};

export const POST = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const name = String(body.name || "").trim();
  const username = String(body.username || "").trim();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "");

  if (name === "") {
    return buildErrorResponse("VALIDATION_ERROR", "Nama user wajib diisi!", []);
  }

  if (username.length < 3) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Username minimal 3 karakter!",
      [],
    );
  }

  if (password.length < 6) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Password minimal 6 karakter!",
      [],
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (existingUser !== null) {
    return buildErrorResponse(
      "USERNAME_EXISTS",
      "Username sudah digunakan!",
      [],
      409,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const subAccount = await prisma.user.create({
    data: {
      name,
      username,
      phone,
      password: hashedPassword,
      storeId: Number(session?.user.storeId),
      isActive: true,
      isSubAccount: true,
      updatedbBy: String(session?.user.username),
    },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      storeId: true,
      isActive: true,
      isSubAccount: true,
      createdAt: true,
    },
  });

  return buildResponse(serializeSubAccount(subAccount));
};

export const PATCH = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = String(body.id || "");
  const isActive = Boolean(body.isActive);

  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      storeId: Number(session?.user.storeId),
      isSubAccount: true,
    },
  });

  if (existingUser === null) {
    return dataNotExistReponse();
  }

  const subAccount = await prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive,
      updatedbBy: String(session?.user.username),
    },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      storeId: true,
      isActive: true,
      isSubAccount: true,
      createdAt: true,
    },
  });

  return buildResponse(serializeSubAccount(subAccount));
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = String(body.id || "");

  const existingUser = await prisma.user.findFirst({
    where: {
      id,
      storeId: Number(session?.user.storeId),
      isSubAccount: true,
    },
  });

  if (existingUser === null) {
    return dataNotExistReponse();
  }

  const subAccount = await prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
      updatedbBy: String(session?.user.username),
    },
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
      storeId: true,
      isActive: true,
      isSubAccount: true,
      createdAt: true,
    },
  });

  return buildResponse(serializeSubAccount(subAccount));
};
