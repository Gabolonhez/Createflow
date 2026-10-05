import { getConnectionsConfig } from './db';

export interface PublishTweetResult {
  success: boolean;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
}

/**
 * Generates an official X (Twitter) Web Intent URL for 1-click publishing
 * without needing an enterprise API tier.
 */
export function generateXIntentUrl(text: string): string {
  const encodedText = encodeURIComponent(text);
  return `https://x.com/intent/tweet?text=${encodedText}`;
}

/**
 * Attempts to publish a tweet via the X API v2 if credentials/bearer token exist.
 * Falls back to instructing manual 1-click web intent if no API credentials configured.
 */
export async function publishToX(
  text: string,
  replyToId?: string
): Promise<PublishTweetResult> {
  const connections = await getConnectionsConfig();
  const bearerToken = process.env.X_BEARER_TOKEN || connections.x_bearer_token;

  if (!bearerToken) {
    return {
      success: false,
      error: 'Token da API do X não configurado. Use o modo "Abrir no X" com 1 clique ou configure X_BEARER_TOKEN.',
    };
  }

  try {
    const payload: Record<string, any> = { text };
    if (replyToId) {
      payload.reply = { in_reply_to_tweet_id: replyToId };
    }

    const response = await fetch('https://api.x.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Erro retornado pelo X: ${errorText}`,
      };
    }

    const data = await response.json();
    const tweetId = data.data?.id;
    const username = connections.x_username || 'i';

    return {
      success: true,
      tweetId,
      tweetUrl: `https://x.com/${username}/status/${tweetId}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Falha de conexão com a API do X.',
    };
  }
}

/**
 * Publishes a thread (fio) of tweets sequentially.
 */
export async function publishXThread(tweets: string[]): Promise<{
  success: boolean;
  publishedCount: number;
  firstTweetUrl?: string;
  error?: string;
}> {
  if (!tweets.length) {
    return { success: false, publishedCount: 0, error: 'Thread vazia.' };
  }

  let lastTweetId: string | undefined = undefined;
  let firstUrl: string | undefined = undefined;
  let count = 0;

  for (const tweetText of tweets) {
    const res = await publishToX(tweetText, lastTweetId);
    if (!res.success) {
      return {
        success: count > 0,
        publishedCount: count,
        firstTweetUrl: firstUrl,
        error: res.error,
      };
    }
    lastTweetId = res.tweetId;
    if (!firstUrl && res.tweetUrl) {
      firstUrl = res.tweetUrl;
    }
    count++;
  }

  return {
    success: true,
    publishedCount: count,
    firstTweetUrl: firstUrl,
  };
}
