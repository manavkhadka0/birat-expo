import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const topic = searchParams.get("topic");

  if (!date || !topic) {
    return NextResponse.json(
      { error: "Date and topic are required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://yachu.baliyoventures.com/api/timeslots/?date=${date}&topic=${topic}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch time slots" },
      { status: 500 }
    );
  }
}
