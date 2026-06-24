import { NextResponse } from "next/server";

export const handleRes = async (res: Response) => {
  try {
    const resJson = await res.json();

    if (res.ok) {
      return resJson;
    } else {
      throw resJson;
    }
  } catch (e) {
    throw e;
  }
};

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

export const notAuthorizeResponse = () => {
  return buildErrorResponse(
    "NOT_AUTHORIZED",
    "Operasi tidak diperbolehkan!",
    [],
    401,
  );
};

export const dataNotExistReponse = () => {
  return buildErrorResponse(
    "DATA_NOT_EXISTS",
    "Data tidak ditemukan!",
    [],
    404,
  );
};

export const mismatchSession = () => {
  return buildErrorResponse(
    "SESSION_MISMATCH",
    "Sesi tidak valid untuk permintaan ini.!",
    [],
    403,
  );
};
