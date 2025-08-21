import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { FieldPacket, QueryResult } from "mysql2/promise";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  let cookie = req.cookies.get("auth")?.value;

  if (cookie) {
    cookie = await verifyToken(cookie);
    console.log(cookie?.toString());

    return;
    const [results, fields]: [QueryResult, FieldPacket[]] = await pool.execute(
      "INSERT INTO notes VALUES () ",
      []
    );
  }
}

// export async function GET(request: Request) {}
