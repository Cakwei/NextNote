import { pool } from "@/lib/db";
import { FieldPacket, QueryResult, ResultSetHeader } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const { email, password }: { [key: string]: string } = await req.json();
    const { status, data, message, code } = await register(email, password);
    return NextResponse.json({ status, data, message }, { status: code });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: "Error", data: {}, message: "An error occured" },
      { status: 404 }
    );
  }
}

async function register(email: string, password: string) {
  let [results]: [ResultSetHeader | QueryResult, FieldPacket[]] =
    await findUserByEmail(email);
  if (Array.isArray(results) && results.length > 0) {
    return {
      status: "Error",
      data: {},
      message: "Account already exists.",
      code: 409,
    };
  }

  // If not exists, add into DB
  [results] = await pool.execute("INSERT INTO accounts VALUES (?, ?, ?)", [
    uuidv4(),
    email,
    password,
  ]);

  // Check for any affected rows
  if ((results as ResultSetHeader).affectedRows > 0) {
    return {
      status: "Success",
      data: {},
      message: "Account created successfully.",
      code: 201,
    };
  }
  // If no rows
  return {
    status: "Error",
    data: {},
    message: "An error occured",
    code: 404,
  };
}

// Quick Functions
async function findUserByEmail(email: string) {
  const [results, fields] = await pool.execute(
    "SELECT * FROM accounts WHERE email = ?",
    [email]
  );
  return [results, fields] as [ResultSetHeader, FieldPacket[]];
}
