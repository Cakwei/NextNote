import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    return NextResponse.json(
      { status: "Success", data: { id: id }, message: "" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
  }
}

export async function GET(request: NextRequest) {}
