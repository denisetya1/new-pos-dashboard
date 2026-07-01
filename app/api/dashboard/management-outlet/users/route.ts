import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
} from "@/lib/response";
import { NextRequest } from "next/server";

type UserOutletResponse = {
  id: bigint;
  userId: string;
  outletId: bigint;
  roleId: bigint;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    username: string;
    phone: string | null;
  };
  role: {
    id: bigint;
    name: string;
  };
};

const userOutletSelect = {
  id: true,
  userId: true,
  outletId: true,
  roleId: true,
  isActive: true,
  user: {
    select: {
      id: true,
      name: true,
      username: true,
      phone: true,
    },
  },
  role: {
    select: {
      id: true,
      name: true,
    },
  },
};

const serializeUserOutlet = (userOutlet: UserOutletResponse) => ({
  ...userOutlet,
  id: userOutlet.id.toString(),
  outletId: userOutlet.outletId.toString(),
  roleId: userOutlet.roleId.toString(),
  role: {
    ...userOutlet.role,
    id: userOutlet.role.id.toString(),
  },
});

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

const ensureSubAccount = async (userId: string, storeId: number) => {
  return prisma.user.findFirst({
    where: {
      id: userId,
      storeId,
      isSubAccount: true,
      isActive: true,
    },
    select: {
      id: true,
    },
  });
};

const ensureRole = async (roleId: number, storeId: number) => {
  return prisma.role.findFirst({
    where: {
      id: roleId,
      OR: [{ storeId }, { storeId: 0 }, { storeId: null }],
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

  const userOutlets = await prisma.userOutlet.findMany({
    where: {
      outletId,
      outlet: {
        storeId: Number(session?.user.storeId),
      },
    },
    orderBy: {
      user: {
        name: "asc",
      },
    },
    select: userOutletSelect,
  });

  return buildResponse({
    contents: userOutlets.map(serializeUserOutlet),
  });
};

export const POST = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const outletId = Number(body.outletId);
  const roleId = Number(body.roleId);
  const userId = String(body.userId || "");
  const storeId = Number(session?.user.storeId);

  if (!outletId || !roleId || userId === "") {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Outlet, user, dan role wajib dipilih!",
      [],
    );
  }

  const [outlet, user, role] = await Promise.all([
    ensureOutlet(outletId, storeId),
    ensureSubAccount(userId, storeId),
    ensureRole(roleId, storeId),
  ]);

  if (outlet === null || user === null || role === null) {
    return dataNotExistReponse();
  }

  const existingUserOutlet = await prisma.userOutlet.findFirst({
    where: {
      userId,
      outletId,
      outlet: {
        storeId,
      },
    },
  });

  const userOutlet =
    existingUserOutlet !== null
      ? await prisma.userOutlet.update({
          where: {
            id: existingUserOutlet.id,
          },
          data: {
            roleId,
            isActive: true,
            updatedBy: String(session?.user.username),
          },
          select: userOutletSelect,
        })
      : await prisma.userOutlet.create({
          data: {
            userId,
            outletId,
            roleId,
            isActive: true,
            updatedBy: String(session?.user.username),
          },
          select: userOutletSelect,
        });

  return buildResponse(serializeUserOutlet(userOutlet));
};

export const PATCH = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);
  const roleId = Number(body.roleId);
  const storeId = Number(session?.user.storeId);

  if (!id || !roleId) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "User outlet dan role wajib dipilih!",
      [],
    );
  }

  const existingUserOutlet = await prisma.userOutlet.findFirst({
    where: {
      id,
      outlet: {
        storeId,
      },
    },
  });

  const role = await ensureRole(roleId, storeId);

  if (existingUserOutlet === null || role === null) {
    return dataNotExistReponse();
  }

  const userOutlet = await prisma.userOutlet.update({
    where: {
      id,
    },
    data: {
      roleId,
      updatedBy: String(session?.user.username),
    },
    select: userOutletSelect,
  });

  return buildResponse(serializeUserOutlet(userOutlet));
};

export const PUT = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);
  const isActive = Boolean(body.isActive);

  const existingUserOutlet = await prisma.userOutlet.findFirst({
    where: {
      id,
      outlet: {
        storeId: Number(session?.user.storeId),
      },
    },
  });

  if (existingUserOutlet === null) {
    return dataNotExistReponse();
  }

  const userOutlet = await prisma.userOutlet.update({
    where: {
      id,
    },
    data: {
      isActive,
      updatedBy: String(session?.user.username),
    },
    select: userOutletSelect,
  });

  return buildResponse(serializeUserOutlet(userOutlet));
};

export const DELETE = async (req: Request) => {
  const session = await auth();
  const body = await req.json();
  const id = Number(body.id);

  const existingUserOutlet = await prisma.userOutlet.findFirst({
    where: {
      id,
      outlet: {
        storeId: Number(session?.user.storeId),
      },
    },
  });

  if (existingUserOutlet === null) {
    return dataNotExistReponse();
  }

  const userOutlet = await prisma.userOutlet.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
      updatedBy: String(session?.user.username),
    },
    select: userOutletSelect,
  });

  return buildResponse(serializeUserOutlet(userOutlet));
};
