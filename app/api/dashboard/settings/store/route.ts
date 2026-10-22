import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  buildErrorResponse,
  buildResponse,
  dataNotExistReponse,
  notAuthorizeResponse,
} from "@/lib/response";

const getContext = async () => {
  const session = await auth();
  const storeId = Number(session?.user.storeId);

  if (!session || !Number.isSafeInteger(storeId) || storeId <= 0) {
    return null;
  }

  return {
    storeId,
    username: String(session.user.username || ""),
  };
};

const storeConfigSelect = {
  id: true,
  name: true,
  pointRewardEnabled: true,
  pointEarningThreshold: true,
  pointRedemptionValue: true,
  minimumRedemptionPoints: true,
};

const serializeStoreConfig = (store: {
  id: bigint;
  name: string;
  pointRewardEnabled: boolean;
  pointEarningThreshold: { toString(): string };
  pointRedemptionValue: { toString(): string };
  minimumRedemptionPoints: number;
}) => ({
  id: store.id.toString(),
  name: store.name,
  pointRewardEnabled: store.pointRewardEnabled,
  pointEarningThreshold: Number(store.pointEarningThreshold.toString()),
  pointRedemptionValue: Number(store.pointRedemptionValue.toString()),
  minimumRedemptionPoints: store.minimumRedemptionPoints,
});

export const GET = async () => {
  const context = await getContext();

  if (!context) {
    return notAuthorizeResponse();
  }

  const store = await prisma.store.findFirst({
    where: { id: context.storeId, isActive: true },
    select: storeConfigSelect,
  });

  if (!store) {
    return dataNotExistReponse();
  }

  return buildResponse(serializeStoreConfig(store));
};

export const PATCH = async (req: Request) => {
  const context = await getContext();

  if (!context) {
    return notAuthorizeResponse();
  }

  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Payload JSON tidak valid.",
      [],
    );
  }

  const name = String(body.name || "").trim();
  const pointRewardEnabled = body.pointRewardEnabled;
  const pointEarningThreshold = Number(body.pointEarningThreshold);
  const pointRedemptionValue = Number(body.pointRedemptionValue);
  const minimumRedemptionPoints = Number(body.minimumRedemptionPoints);

  if (name.length < 2 || name.length > 191) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Nama toko wajib diisi antara 2 sampai 191 karakter.",
      [],
    );
  }

  if (typeof pointRewardEnabled !== "boolean") {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Status point reward tidak valid.",
      [],
    );
  }

  if (
    !Number.isSafeInteger(pointEarningThreshold) ||
    pointEarningThreshold < 1 ||
    pointEarningThreshold > 1_000_000_000
  ) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Nominal perolehan poin harus berupa angka bulat antara 1 dan 1.000.000.000.",
      [],
    );
  }

  if (
    !Number.isSafeInteger(pointRedemptionValue) ||
    pointRedemptionValue < 1 ||
    pointRedemptionValue > 1_000_000_000
  ) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Nilai konversi poin harus berupa angka bulat antara 1 dan 1.000.000.000.",
      [],
    );
  }

  if (
    !Number.isSafeInteger(minimumRedemptionPoints) ||
    minimumRedemptionPoints < 1 ||
    minimumRedemptionPoints > 1_000_000_000
  ) {
    return buildErrorResponse(
      "VALIDATION_ERROR",
      "Minimal penukaran poin harus berupa angka bulat antara 1 dan 1.000.000.000.",
      [],
    );
  }

  const existingStore = await prisma.store.findFirst({
    where: { id: context.storeId, isActive: true },
    select: { id: true },
  });

  if (!existingStore) {
    return dataNotExistReponse();
  }

  const store = await prisma.store.update({
    where: { id: context.storeId },
    data: {
      name,
      pointRewardEnabled,
      pointEarningThreshold,
      pointRedemptionValue,
      minimumRedemptionPoints,
      updatedBy: context.username,
    },
    select: storeConfigSelect,
  });

  return buildResponse(serializeStoreConfig(store));
};
