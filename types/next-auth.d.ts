import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    name: string;
    id: string;
    username: string;
    emailVerified: Date | null;
    image: string | null;
    phone: string | null;
    storeId: bigint | undefied;
    outletId?: bigint | undefied;
    roleId: bigint | undefied;
    privileges:
      | string
      | number
      | boolean
      | any[]
      | JsonObject
      | null
      | undefined;
    isSubAccount: boolean | null;
    isActive: boolean;
    lastLogin: Date | null;
    createdAt?: Date;
    updatedAt?: Date | null;
    deletedAt?: Date | null;
    updateBy?: string | null;
  }

  interface Session {
    user: User & DefaultSession["user"];
  }
}
