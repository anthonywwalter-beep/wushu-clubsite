export async function onRequestGet(context) {
  const clientId = context.env.GITHUB_CLIENT_ID;
  const redirectUri = `${context.request.url.split('/api/auth')[0]}/api/callback`;

  const githubAuthUrl =
    `https://github.com/login/oauth/authorize` +
    `?client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=repo,user`;

  return Response.redirect(githubAuthUrl, 302);
}
