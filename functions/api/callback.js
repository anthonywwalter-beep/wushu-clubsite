export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code");

  const clientId = context.env.GITHUB_CLIENT_ID;
  const clientSecret = context.env.GITHUB_CLIENT_SECRET;

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code
    })
  });

  const tokenData = await tokenResponse.json();
  const accessToken = tokenData.access_token;

  const redirectToCms = `${url.origin}/cms/#access_token=${accessToken}`;
  return Response.redirect(redirectToCms, 302);
}
