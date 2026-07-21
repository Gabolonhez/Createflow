const BASE_URL = 'https://graph.instagram.com/v25.0';

export interface InstagramProfile {
  user_id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
}

export function getOAuthUrl(redirectUri: string): string {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  if (!clientId) throw new Error('INSTAGRAM_CLIENT_ID must be defined');

  const scope = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
  ].join(',');

  return `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&response_type=code`;
}

export async function exchangeCodeForShortToken(
  code: string,
  redirectUri: string
): Promise<{ access_token: string; user_id: string }> {
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('INSTAGRAM_CLIENT_ID and INSTAGRAM_CLIENT_SECRET must be defined');
  }

  const formData = new URLSearchParams();
  formData.append('client_id', clientId);
  formData.append('client_secret', clientSecret);
  formData.append('grant_type', 'authorization_code');
  formData.append('redirect_uri', redirectUri);
  formData.append('code', code);

  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to exchange short-lived token: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function exchangeShortTokenForLongToken(
  shortToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
  if (!clientSecret) throw new Error('INSTAGRAM_CLIENT_SECRET must be defined');

  const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to exchange long-lived token: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function refreshLongToken(
  longToken: string
): Promise<{ access_token: string; expires_in: number }> {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${longToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to refresh long-lived token: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function getProfile(accessToken: string): Promise<InstagramProfile> {
  const url = `${BASE_URL}/me?fields=user_id,username,name,profile_picture_url&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to get Instagram profile: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function subscribeApp(instagramUserId: string, accessToken: string): Promise<boolean> {
  const url = `${BASE_URL}/${instagramUserId}/subscribed_apps?subscribed_fields=comments,messages&access_token=${accessToken}`;

  const res = await fetch(url, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to subscribe app to webhooks: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.success === true;
}

export async function sendMetaMessage(
  instagramUserId: string,
  payload: any,
  accessToken: string
): Promise<any> {
  const url = `${BASE_URL}/${instagramUserId}/messages?access_token=${accessToken}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to send message: ${JSON.stringify(err)}`);
  }

  return res.json();
}

// Resposta pública em comentário
export async function sendCommentReply(
  commentId: string,
  text: string,
  accessToken: string
): Promise<any> {
  const url = `${BASE_URL}/${commentId}/replies?access_token=${accessToken}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: text }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to send comment reply: ${JSON.stringify(err)}`);
  }

  return res.json();
}

export async function getMediaList(instagramUserId: string, accessToken: string): Promise<any[]> {
  const url = `${BASE_URL}/${instagramUserId}/media?fields=id,media_type,media_url,thumbnail_url,caption,permalink&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Failed to get media list: ${JSON.stringify(err)}`);
  }

  const data = await res.json();
  return data.data || [];
}
