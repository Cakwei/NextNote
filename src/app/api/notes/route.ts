import { pool } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import { FieldPacket, ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { findUserByEmail } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    let cookie = req.cookies.get("auth")?.value;
    const { title } = await req.json();

    if (cookie) {
      cookie = await verifyToken(cookie);

      // If cookie cannot be verified
      if (!cookie) {
        return NextResponse.json(
          { status: "Error", data: {}, message: "Cookie is invalid" },
          { status: 201 }
        );
      }

      if (!title) {
        return NextResponse.json(
          { status: "Error", data: {}, message: "Note title is not given" },
          { status: 409 }
        );
      }

      cookie = JSON.parse(cookie).email;

      // If cookie can be verified,
      // search for user then create new note
      let [result, field]: [RowDataPacket[] | ResultSetHeader, FieldPacket[]] =
        await findUserByEmail(cookie || "");

      const uuid = uuidv4();

      // eslint-disable-next-line
      [result, field] = await pool.execute(
        "INSERT INTO notes (noteId, accountId, title) VALUES (?, ?, ?)",
        [uuid, (result as unknown as RowDataPacket[])[0].accountId, title]
      );
      return NextResponse.json(
        {
          status: "Success",
          data: { noteId: uuid },
          message: "Successfully created note",
        },
        { status: 201 }
      );
    }
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: "Error", data: {}, message: "Error creating note" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    let cookie = req.cookies.get("auth")?.value;
    const searchParams = req.nextUrl.searchParams;
    const email = searchParams.get("email");
    const noteId = searchParams.get("noteId");

    if (cookie) {
      cookie = await verifyToken(cookie);

      // If cookie cannot be verified
      if (!cookie) {
        return NextResponse.json(
          { status: "Error", data: {}, message: "Cookie is invalid" },
          { status: 201 }
        );
      }

      cookie = JSON.parse(cookie).email;

      if (cookie && email === cookie && noteId) {
        // If cookie can be verified,
        // search for user then create new note
        let [result, field]: [
          RowDataPacket[] | ResultSetHeader,
          FieldPacket[]
        ] = await findUserByEmail(cookie || "");

        // eslint-disable-next-line
        [result, field] = (await pool.execute(
          "SELECT data, title FROM notes LEFT JOIN accounts ON notes.accountId = accounts.accountId WHERE noteId = ? AND accounts.email = ?",
          [noteId, email]
        )) as [RowDataPacket[], FieldPacket[]];

        // If result is found
        if (result[0]) {
          // Retrieved blob from database ('data' column)
          const buffer = Buffer.from(result[0].data || "", "utf8");

          return NextResponse.json(
            {
              status: "Success",
              data: {
                data:
                  // Check if buffer is empty or no
                  safeParseBuffer(buffer),
                title: result[0].title,
              },
              message: "Successfully fetch note data",
            },
            { status: 200 }
          );
        } else {
          return NextResponse.json(
            {
              status: "Error",
              data: {},
              message: "This note is not made by this account",
            },
            { status: 307 }
          );
        }
      }
    }
    return NextResponse.json(
      {
        status: "Error",
        data: {},
        message: "Error occured validating your cookie",
      },
      { status: 403 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: "Error", data: {}, message: "Error fetching note" },
      { status: 500 }
    );
  }
}

function safeParseBuffer(buffer: Buffer) {
  // Check if the buffer has content before attempting to parse.
  if (buffer.length > 0) {
    try {
      // Attempt to parse the buffer as a UTF-8 string.
      console.log(JSON.parse(buffer.toString("utf8")));
      return JSON.parse(buffer.toString("utf8"));
    } catch (e) {
      // If an error occurs during parsing, log the error and return null.
      console.error("Error parsing JSON:", e);
      return null;
    }
  }
  return null;
}
