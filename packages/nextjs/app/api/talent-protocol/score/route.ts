import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const accountSource = searchParams.get("account_source");

  if (!id || !accountSource) {
    return NextResponse.json({ error: "Missing required parameters: id and account_source" }, { status: 400 });
  }

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("id", id);
    queryParams.append("account_source", accountSource);

    const response = await fetch(`https://api.talentprotocol.com/score?${queryParams.toString()}`, {
      headers: {
        Accept: "application/json",
        "X-API-KEY": process.env.TALENT_PROTOCOL_API_KEY || "",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch talent score: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Talent Protocol score:", error);
    return NextResponse.json({ error: (error as Error).message || "Failed to fetch talent score" }, { status: 500 });
  }
}
