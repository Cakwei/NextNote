import { pool } from "@/lib/db";
import { FieldPacket, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { email, password }: { [key: string]: string } = await req.json();

    if (
      // Check input are string, also check if empty
      (typeof email !== "string" || typeof password !== "string") &&
      (!email || !password)
    ) {
      return NextResponse.json(
        { status: "Error", data: {}, message: "Invalid request" },
        { status: 400 }
      );
    }

    const { status, data, message, code } = await login(email, password);
    return NextResponse.json({ status, data, message }, { status: code });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: "Error", data: {}, message: "An error occured" },
      { status: 404 }
    );
  }
}

async function login(email: string, password: string) {
  const [results]: [RowDataPacket[], FieldPacket[]] = await pool.execute(
    "SELECT * FROM accounts WHERE email = ? AND password = ?",
    [email, password]
  );

  // If account exists
  if (Array.isArray(results) && results.length > 0) {
    const SECRET_KEY = process.env.JWT_SECRET;
    if (!SECRET_KEY) {
      throw new Error("JWT_SECRET is not defined");
    }

    // Sign and add JWT to cookie
    const cookieStore = cookies();
    const token = await signToken({ email: email });

    if (!token) {
      throw Error("Error occured when signing token ");
    }

    (await cookieStore).set("auth", token, { httpOnly: true, secure: true });

    return {
      status: "Success",
      data: { token: token, email: email },
      message: "Logged in successfully",
      code: 200,
    };
  }

  // If account does not exist
  return {
    status: "Error",
    data: {},
    message: "Account does not exist",
    code: 403,
  };
}
