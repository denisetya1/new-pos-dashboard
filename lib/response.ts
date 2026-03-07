import { NextResponse } from "next/server";

export const buildResponse = (data: any) => {
  return NextResponse.json({
    code: "SUCCESS",
    message: "",
    errors: [],
    data,
  });
};

export const buildErrorResponse = (
  code: string,
  message: string,
  errorsMsgs: string[],
  status: number = 400,
) => {
  return NextResponse.json(
    {
      code,
      message,
      errors: errorsMsgs,
    },
    { status },
  );
};
