import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from 'next';
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const json = <T>(data: T, init?: ResponseInit) => NextResponse.json(data, init);

export const handleError = (error: unknown, res: NextApiResponse) => {
  if (error instanceof ApiError) {
    return res.status(error.status).json({ message: error.message })
    // return NextResponse.json({ message: error.message }, { status: error.status });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal Server Error" })
  // return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
};

export const assert = (condition: unknown, status: number, message: string) => {
  if (!condition) {
    throw new ApiError(status, message);
  }
};
