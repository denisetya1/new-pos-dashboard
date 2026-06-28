//BigInt stringify fix - must be at top before any imports
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter }).$extends({
  name: "POSExtension",
  model: {
    $allModels: {
      async findManyAndCount<Model, Args>(
        this: Model,
        args: Prisma.Exact<Args, Prisma.Args<Model, "findMany">>,
      ): Promise<[Prisma.Result<Model, Args, "findMany">, number]> {
        // For driver adapters, we run queries sequentially instead of using $transaction
        // which is not available inside $extends with driver adapters
        const results = await Promise.all([
          (this as any).findMany(args),
          (this as any).count({ where: (args as any).where }),
        ]);
        return results as [Prisma.Result<Model, Args, "findMany">, number];
      },
      async delete<Model, Args>(
        this: Model,
        args: Prisma.Exact<Args, Prisma.Args<Model, "findMany">>,
      ): Promise<[Prisma.Result<Model, Args, "findMany">, number]> {
        return (this as any).update({
          ...(args as any),
          data: {
            deletedAt: new Date(),
          },
        });
      },
    },
  },
  query: {
    $allModels: {
      async $allOperations({ model, args, query, operation }): Promise<any> {
        // 💡 Jika operasinya findUnique, belokkan ke findFirst agar mau menerima filter deletedAt
        if (operation === "findUnique") {
          return (prisma as any)[model].findFirst({
            where: {
              ...args.where,
              deletedAt: null,
            },
          });
        }

        if (operation === "findMany" || operation === "findFirst") {
          args.where = {
            ...args.where,
            deletedAt: null,
          };
        }

        return query(args);
      },
    },
  },
});

export { prisma };

//BigInt stringify fix
declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function (): string {
  return this.toString();
};
