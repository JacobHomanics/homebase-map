import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.redirect(new URL("/?error=invalid_twitter_response", request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.twitter.com/2/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_VERCEL_URL}/api/auth/twitter/callback`,
        client_id: process.env.TWITTER_CLIENT_ID!,
        client_secret: process.env.TWITTER_CLIENT_SECRET!,
        code_verifier: state,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) {
      throw new Error("Failed to get access token");
    }

    // Get user info
    const userResponse = await fetch("https://api.twitter.com/2/users/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    const username = userData.data?.username;

    if (!username) {
      throw new Error("Failed to get username");
    }

    // Redirect back to profile page with success params
    return NextResponse.redirect(new URL(`/profile?twitter_connected=true&twitter_username=${username}`, request.url));
  } catch (error) {
    console.error("Twitter auth error:", error);
    return NextResponse.redirect(new URL("/?error=twitter_auth_failed", request.url));
  }
}
