import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const { access_token } = await tokenResponse.json();

    // Get user data
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userData = await userResponse.json();

    // Store the GitHub connection in the user's profile
    // TODO: Implement this with your database/storage solution

    // Redirect back to profile page with success state
    const redirectUrl = new URL("/profile", request.url);
    redirectUrl.searchParams.set("github_connected", "true");
    redirectUrl.searchParams.set("github_username", userData.login);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    return NextResponse.redirect(new URL("/profile", request.url));
  }
}
