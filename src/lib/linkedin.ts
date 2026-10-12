export async function getLinkedInOAuthUrl(redirectUri: string, explicitClientId?: string): Promise<string> {
  let clientId = explicitClientId || process.env.LINKEDIN_CLIENT_ID;
  if (!clientId) {
    const { getConnectionsConfig } = await import('@/lib/db');
    const cfg = await getConnectionsConfig();
    clientId = cfg.linkedin_client_id;
  }

  if (!clientId) {
    throw new Error('LINKEDIN_CLIENT_ID não está configurado. Salve as credenciais na aba Conexões ou no .env.local.');
  }

  // Usamos state simples de timestamp para fins locais
  const state = Date.now().toString();
  const scope = encodeURIComponent('openid profile email w_member_social');
  
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&state=${state}&scope=${scope}`;
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  explicitClientId?: string,
  explicitClientSecret?: string
) {
  let clientId = explicitClientId || process.env.LINKEDIN_CLIENT_ID;
  let clientSecret = explicitClientSecret || process.env.LINKEDIN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const { getConnectionsConfig } = await import('@/lib/db');
    const cfg = await getConnectionsConfig();
    clientId = clientId || cfg.linkedin_client_id;
    clientSecret = clientSecret || cfg.linkedin_client_secret;
  }

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais do LinkedIn (Client ID ou Client Secret) não estão configuradas.');
  }

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao trocar código por token do LinkedIn: ${errText}`);
  }

  return response.json(); // retorna { access_token, expires_in }
}

export async function fetchLinkedInProfile(accessToken: string) {
  // Chamada ao endpoint OIDC UserInfo
  const response = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao buscar perfil do LinkedIn: ${errText}`);
  }

  const data = await response.json();
  // Retorna sub (ID do perfil) e nome
  return {
    id: data.sub,
    name: `${data.given_name} ${data.family_name}`,
  };
}

export async function publishToLinkedIn(
  accessToken: string,
  profileId: string,
  text: string,
  mediaUrl?: string
) {
  const url = 'https://api.linkedin.com/v2/posts';
  
  const body: any = {
    author: `urn:li:person:${profileId}`,
    commentary: text,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: 'PUBLISHED'
  };

  if (mediaUrl) {
    body.content = {
      article: {
        source: mediaUrl,
        title: 'Compartilhado via CreateFlow',
      }
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao publicar no LinkedIn: ${errText}`);
  }

  // A API do LinkedIn retorna o ID no header x-restli-id
  const postId = response.headers.get('x-restli-id');
  return { success: true, postId };
}

/**
 * Generates an official LinkedIn share intent URL for 1-click manual sharing
 */
export function generateLinkedInIntentUrl(text: string, url?: string): string {
  const params = new URLSearchParams();
  if (url) {
    params.set('url', url);
  }
  // LinkedIn feed sharing with pre-filled text
  const shareText = encodeURIComponent(text);
  return `https://www.linkedin.com/feed/?shareActive=true&text=${shareText}`;
}

