import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { buildErrorResponse, notAuthorizeResponse } from "./response";

type Handler = (req: NextRequest) => Promise<NextResponse>;

export const withRoleMiddleware = (
  handler: Handler,
  privId: string,
): Handler => {
  return async (req) => {
    try {
      const session = await auth();

      //check session and role access
      if (!session || !session?.user.privileges.includes(privId)) {
        return notAuthorizeResponse();
      }

      // lanjut ke handler utama
      return await handler(req);
    } catch (error) {
      console.error(error);

      return buildErrorResponse(
        "INTERNAL_SERVER_ERROR",
        "Internal Server Error",
        [],
        500,
      );
    }
  };
};
