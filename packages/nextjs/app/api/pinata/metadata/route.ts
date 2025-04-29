import { NextResponse } from "next/server";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function POST(request: Request) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json({ error: "Pinata API keys not configured" }, { status: 500 });
    }

    const metadata = await request.json();

    if (!metadata) {
      return NextResponse.json({ error: "No metadata provided" }, { status: 400 });
    }

    // Upload to Pinata
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Change from Bearer token to explicit header authentication
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: "profile-metadata.json",
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload metadata to Pinata");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload metadata to Pinata" },
      { status: 500 },
    );
  }
}
