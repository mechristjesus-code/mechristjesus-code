import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * GET  /api/auth/google        → redirect to Google consent screen
 * GET  /api/auth/google?code=  → exchange code for access token (callback)
 */
export async function GET(req: NextRequest) {
  const code         = req.nextUrl.searchParams.get("code");
  const clientId     = process.env.GOOGLE_CLIENT_ID     ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? "";
  const appUrl       = process.env.NEXT_PUBLIC_APP_URL  ?? "http://localhost:13000";
  const redirectUri  = `${appUrl}/api/auth/google`;

  // ── Step 1: no code yet → redirect to consent ─────────────
  if (!code) {
    if (!clientId) {
      return NextResponse.json({
        error: "GOOGLE_CLIENT_ID not set. Add it to .env to enable YouTube upload.",
        setup: "https://console.cloud.google.com/apis/credentials",
      }, { status: 501 });
    }
    const params = new URLSearchParams({
      client_id:     clientId,
      redirect_uri:  redirectUri,
      response_type: "code",
      scope: [
        "https://www.googleapis.com/auth/youtube.upload",
        "https://www.googleapis.com/auth/youtube",
      ].join(" "),
      access_type: "offline",
      prompt:      "consent",
    });
    return NextResponse.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    );
  }

  // ── Step 2: exchange code for token ───────────────────────
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code, client_id: clientId, client_secret: clientSecret,
        redirect_uri: redirectUri, grant_type: "authorization_code",
      }),
    });
    const tokenJson = await tokenRes.json();
    if (tokenJson.error) {
      return NextResponse.json({ error: tokenJson.error_description }, { status: 400 });
    }
    const { access_token, refresh_token, expires_in } = tokenJson;
    // Return token in a page the user can copy from
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>body{background:#030712;color:#fff;font-family:sans-serif;display:flex;
align-items:center;justify-content:center;min-height:100vh;flex-direction:column;gap:1rem;padding:2rem;text-align:center}
code{background:#1a1a2e;border:1px solid #333;border-radius:8px;padding:1rem;font-size:.85rem;
word-break:break-all;display:block;max-width:600px;cursor:pointer}
h2{color:#a78bfa}p{color:#9ca3af;font-size:.9rem}</style></head>
<body>
<div style="font-size:2.5rem">✅</div>
<h2>Google Auth Successful</h2>
<p>Copy your access token below and paste it into the Monetize tab → YouTube Upload field.</p>
<code onclick="navigator.clipboard.writeText(this.innerText);this.style.borderColor='#4ade80'">${access_token}</code>
<p style="font-size:.75rem;color:#6b7280">Expires in ${expires_in}s · Click token to copy · <a href="/studio" style="color:#a78bfa">Back to Studio</a></p>
</body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
