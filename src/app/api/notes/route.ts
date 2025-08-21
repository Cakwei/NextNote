import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import {
  FieldPacket,
  QueryResult,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  let cookie = req.cookies.get("auth")?.value;

  if (cookie) {
    cookie = await verifyToken(cookie);

    // If cookie cannot be verified
    if (!cookie) {
      return NextResponse.json(
        { status: "Error", data: {}, message: "Cookie is invalid" },
        { status: 201 }
      );
    }

    cookie = JSON.parse(cookie);

    // If cookie can be verified,
    // search for user then create new note
    let [result, field]: [ResultSetHeader, FieldPacket[]] = await pool.execute(
      "SELECT * FROM accounts notes WHERE email = ?",
      [cookie]
    );

    const uuid = uuidv4();
    [result, field] = await pool.execute("INSERT INTO notes VALUES ()", []);
  }
}

// export async function GET(request: Request) {}
