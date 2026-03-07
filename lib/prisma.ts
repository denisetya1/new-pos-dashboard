//BigInt stringify fix - must be at top before any imports
declare global {
  interface BigInt {
    toJSON(): string
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
    name: 'POSExtension',
    model: {
      $allModels: {
        async findManyAndCount<Model, Args>(
          this: Model,
          args: Prisma.Exact<Args, Prisma.Args<Model, 'findMany'>>
        ): Promise<[Prisma.Result<Model, Args, 'findMany'>, number]> {
          // For driver adapters, we run queries sequentially instead of using $transaction
          // which is not available inside $extends with driver adapters
          const results = await Promise.all([
            (this as any).findMany(args),
            (this as any).count({ where: (args as any).where })
          ]);
          return results as [Prisma.Result<Model, Args, 'findMany'>, number];
        },
        async delete<Model, Args>(
          this: Model,
          args: Prisma.Exact<Args, Prisma.Args<Model, 'findMany'>>
        ): Promise<[Prisma.Result<Model, Args, 'findMany'>, number]> {
          return (this as any).update({
            ...args as any,
            data: {
              deletedAt: new Date()
            }
          })
        }
      }
    },
    query: {
      $allModels: {
        async $allOperations({ args, query, operation }) {
          if (operation === "findMany" || operation === "findFirst" || operation === "findUnique") {

            args.where = {
              ...args.where,
              deletedAt: null
            }
          }

          return query(args);
        }
      }
    }
  });;

export { prisma };

