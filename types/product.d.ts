import { Prisma } from "@/generated/prisma/client";

export type ProductWithBrandCategory = Prisma.ProductGetPayload<{
  include: { brand: true; category: true };
}>;

export type ProductWithStocks = Prisma.ProductGetPayload<{
  include: {
    brand: true;
    category: true;
    stocks: { include: { outlet: true } };
  };
}>;
