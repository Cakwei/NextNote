import { pool } from "@/lib/db";
import { FieldPacket, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const { email, password }: { [key: string]: string } = await req.json();
    const { status, data, message, code } = await login(email, password);
    console.log('From login')
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
  let [results, fields]: [RowDataPacket[], FieldPacket[]] = await pool.execute(
    "SELECT * FROM accounts WHERE email = ? AND password = ?",
    [email, password]
  );

  // If account exists
  if (Array.isArray(results) && results.length > 0) {
    return {
      status: "Success",
      data: {},
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
