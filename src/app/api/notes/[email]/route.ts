import { findUserByEmail, pool } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import {
  FieldPacket,
  QueryResult,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";

// Fetch all note based on email address
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const emailParam = (await params).email;
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

      if (email && emailParam) {
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
      return NextResponse.json(
        {
          status: "Error",
          data: {},
          message: "Parameter does not match email",
        },
        { status: 200 }
      );
    }
  } catch (err) {
    console.log(err);
  }
}

// Updates note data
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ title: string; email: string }> }
) {
  try {
    let cookie = req.cookies.get("auth")?.value;
    const body: {
      noteData: { type: string; content: object[] };
      noteId: string;
      noteTitle: string;
    } = await req.json();
    const emailParams = (await params).email;

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

      if (email && body && emailParams === email) {
        let [results]: [QueryResult, FieldPacket[]] = await findUserByEmail(
          email
        );

        [results] = (await pool.execute(
          "UPDATE notes SET data = ?, title = ?, modifiedDate = NOW() WHERE accountId = ? AND noteId = ?",
          [body.noteData, body.noteTitle, results[0].accountId, body.noteId]
        )) as [ResultSetHeader, FieldPacket[]];
        console.log(body.noteData);
        if (results.affectedRows > 0) {
          return NextResponse.json(
            {
              status: "Success",
              data: {},
              message: "Successfully updated note data in database",
            },
            { status: 200 }
          );
        }
      }
    }

    return NextResponse.json(
      { status: "Error", data: {}, message: "Failed to update note" },
      { status: 401 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: "Error", data: "", message: "Failed to update note" },
      { status: 500 }
    );
  }
}

// async function updateNoteDataInDB() {
//   const [results, fields] = await pool.execute("", []);
// }

// export async function GET(request: NextRequest) {}
