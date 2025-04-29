import { NextResponse } from "next/server";
import { Readable } from "stream";

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function POST(request: Request) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json({ error: "Pinata API keys not configured" }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Create form data for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append("file", new Blob([buffer]), file.name);

    // Upload to Pinata
    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        // Change from Bearer token to explicit header authentication
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
      body: pinataFormData,
    });

    if (!response.ok) {
      const error = await response.json();

      console.log("error", error);
      throw new Error(error.error || "Failed to upload to Pinata");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error uploading to Pinata:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload to Pinata" },
      { status: 500 },
    );
  }
}
