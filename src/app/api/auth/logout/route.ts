import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const isSuccess = await logOut();
    if (isSuccess) {
      return NextResponse.json(
        { status: "Success", data: {}, message: "Successfully logged out" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { status: "Error", data: {}, message: "Log out failed" },
      { status: 401 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { status: "Error", data: {}, message: "An error occured" },
      { status: 404 }
    );
  }
}

async function logOut() {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get("auth");
    if (cookie) {
      cookieStore.delete("auth");
      return true;
    }
  } catch (e) {
    console.error(e);
    return false;
  }
}
