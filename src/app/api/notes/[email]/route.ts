import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const email = (await params).email;
    let cookie = req.cookies.get("auth")?.value;

    if (cookie) {
      cookie = await verifyToken(cookie);

      // If cookie cannot be verified
      if (!cookie) {
        return NextResponse.json(
          { status: "Error", data: {}, message: "Cookie is invalid" },
          { status: 401 }
        );
      }

      const email = JSON.parse(cookie).email;

      const [results]: [RowDataPacket[] | ResultSetHeader, FieldPacket[]] =
        (await pool.execute(
          "SELECT noteId, creationDate, title, data, modifiedDate FROM accounts LEFT JOIN notes ON accounts.accountId = notes.accountId WHERE email = ?",
          [email]
        )) as [RowDataPacket[], FieldPacket[]];

      if (results.length > 0) {
        return NextResponse.json(
          {
            status: "Success",
            data: { results: results },
            message: "Found notes attached to account",
          },
          { status: 200 }
        );
      }
    }
  } catch (err) {
    console.log(err);
  }
}

// export async function GET(request: NextRequest) {}
