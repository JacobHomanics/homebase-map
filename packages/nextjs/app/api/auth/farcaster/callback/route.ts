import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/profile?error=farcaster_auth_failed", request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/profile?error=no_code", request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://warpcast.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_FARCASTER_CLIENT_ID!,
        client_secret: process.env.FARCASTER_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_VERCEL_URL || "http://localhost:3000"}/api/auth/farcaster/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token");
    }

    const { access_token } = await tokenResponse.json();

    // Get user profile
    const profileResponse = await fetch("https://warpcast.com/api/v2/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Failed to get user profile");
    }

    const { username } = await profileResponse.json();

    // Redirect back to profile page with success params
    return NextResponse.redirect(
      new URL(`/profile?farcaster_connected=true&farcaster_username=${encodeURIComponent(username)}`, request.url),
    );
  } catch (error) {
    console.error("Farcaster auth error:", error);
    return NextResponse.redirect(new URL("/profile?error=farcaster_auth_failed", request.url));
  }
}
