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

      if (cookie && searchParams.get("email") === cookie) {
        // If cookie can be verified,
        // search for user then create new note
        let [result, field]: [
          RowDataPacket[] | ResultSetHeader,
          FieldPacket[]
        ] = await findUserByEmail(cookie || "");

        // eslint-disable-next-line
        [result, field] = (await pool.execute(
          "SELECT data, title FROM notes WHERE accountId = ? ",
          [(result as RowDataPacket[])[0].accountId]
        )) as [RowDataPacket[], FieldPacket[]];

        // Retrieved blob from database ('data' column)
        const buffer = Buffer.from(result[0].data, "utf8");

        return NextResponse.json(
          {
            status: "Success",
            data: {
              data: JSON.parse(buffer.toString("utf8")),
              title: result[0].title,
            },
            message: "Successfully fetch note data",
          },
          { status: 201 }
        );
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
      { status: "Error", data: {}, message: "Error creating note" },
      { status: 500 }
    );
  }
}
