/* CreateFlow DOM Extractor for LinkedIn & Instagram Web */
(() => {
  function parseMetric(raw) {
    if (!raw) return 0;
    const str = String(raw).trim().toLowerCase();
    if (!str) return 0;
    let mult = 1;
    if (/(mil\b|\bk\b)/.test(str)) mult = 1000;
    else if (/(m\b|milh)/.test(str)) mult = 1000000;
    const num = str.replace(/[^0-9.,]/g, '');
    if (!num) return 0;
    if (mult > 1) {
      const f = parseFloat(num.replace(',', '.'));
      return Number.isFinite(f) ? Math.round(f * mult) : 0;
    }
    if (/^\d{1,3}([.,]\d{3})+$/.test(num)) {
      return parseInt(num.replace(/[.,]/g, ''), 10) || 0;
    }
    const f = parseFloat(num.replace(',', '.'));
    return Number.isFinite(f) ? Math.round(f) : 0;
  }

  const LINKEDIN_URN_RE = /urn:li:(?:activity|ugcPost|share):\d+/i;
  const LINKEDIN_NOISE_LINE_RE =
    /^(?:gostei|comentar|compartilhar|enviar|seguir|seguindo|salvar|salvo|like|comment|repost|send|follow|following|save|saved|…?\s*ver mais|…?\s*see more|visualizar perfil|view profile|publicação|feed post|(?:•\s*)?(?:1º|2º|3º|1st|2nd|3rd))$/i;

  function extractLinkedInUrn(el) {
    if (!el) return null;
    for (const attr of ['data-chameleon-result-urn', 'data-urn', 'data-id']) {
      const val = el.getAttribute?.(attr);
      const m = val && val.match(LINKEDIN_URN_RE);
      if (m) return m[0];
    }
    const nested = el.querySelector?.('[data-chameleon-result-urn], [data-urn], [data-id]');
    if (nested) {
      for (const attr of ['data-chameleon-result-urn', 'data-urn', 'data-id']) {
        const val = nested.getAttribute(attr);
        const m = val && val.match(LINKEDIN_URN_RE);
        if (m) return m[0];
      }
    }
    const urnLink = el.querySelector?.('a[href*="urn:li:"]');
    const linkMatch = urnLink?.href?.match(LINKEDIN_URN_RE);
    return linkMatch ? linkMatch[0] : null;
  }

  function cleanLinkedInText(raw) {
    if (!raw) return '';
    const lines = String(raw)
      .split(/\r?\n/)
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .filter((line) => line.length > 0 && !LINKEDIN_NOISE_LINE_RE.test(line));
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  function extractPostFromLinkedInContainer(el, seen, fallbackPostUrl) {
    if (!el) return null;

    const textCandidates = Array.from(
      el.querySelectorAll(
        '.update-components-text, .feed-shared-update-v2__description, .entity-result__summary, .entity-result__content-summary, .break-words, [dir="ltr"]'
      )
    )
      .map((node) => cleanLinkedInText(node.innerText || ''))
      .filter((txt) => txt.length >= 15);

    const bestComponentText = textCandidates.sort((a, b) => b.length - a.length)[0] || '';
    const captionText =
      bestComponentText.length >= 15 ? bestComponentText : cleanLinkedInText(el.innerText || '');

    if (!captionText || captionText.length < 15) return null;

    const postLinkEl = el.querySelector(
      'a[href*="/feed/update/"], a[href*="/posts/"], a[href*="urn:li:activity"], a[href*="urn:li:ugcPost"]'
    );
    const urn = extractLinkedInUrn(el);
    let postUrl = postLinkEl?.href ? postLinkEl.href.split('?')[0] : null;
    if (!postUrl && urn) {
      postUrl = `https://www.linkedin.com/feed/update/${urn}/`;
    }
    if (!postUrl && fallbackPostUrl) {
      postUrl = fallbackPostUrl;
    }

    const dedupeKey = postUrl || urn || captionText.slice(0, 80);
    if (seen.has(dedupeKey)) return null;
    seen.add(dedupeKey);

    const authorEl = el.querySelector(
      '.update-components-actor__name span[aria-hidden="true"], .update-components-actor__title span[aria-hidden="true"], .entity-result__title-text a span[aria-hidden="true"], .entity-result__title-text a, .feed-shared-actor__name, a[href*="/in/"] span[aria-hidden="true"], a[href*="/company/"] span[aria-hidden="true"]'
    );
    const profileLinkEl = el.querySelector('a[href*="/in/"], a[href*="/company/"]');
    const rawAuthor = authorEl?.innerText || profileLinkEl?.innerText || '';
    const authorName = cleanLinkedInText(rawAuthor).split('\n')[0]?.trim() || null;

    let authorHandle = null;
    if (profileLinkEl?.href) {
      const m = profileLinkEl.href.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/i);
      if (m) authorHandle = m[1];
    }

    const likesEl = el.querySelector(
      '.social-details-social-counts__reactions-count, button[aria-label*="reaç" i], button[aria-label*="like" i], button[aria-label*="curtid" i]'
    );
    const commentsEl = el.querySelector(
      '.social-details-social-counts__comments, button[aria-label*="coment" i], button[aria-label*="comment" i]'
    );

    const rawText = el.innerText || '';
    const likesFallback = rawText.match(/([\d.,]+\s*(?:mil|k|m)?)\s*(?:reaç(?:ões|ão)|likes?|curtidas?)/i);
    const commentsFallback = rawText.match(/([\d.,]+\s*(?:mil|k|m)?)\s*(?:comentários?|comments?)/i);

    const likesCount =
      parseMetric(likesEl?.innerText || likesEl?.getAttribute?.('aria-label')) ||
      parseMetric(likesFallback?.[1]);
    const commentsCount =
      parseMetric(commentsEl?.innerText || commentsEl?.getAttribute?.('aria-label')) ||
      parseMetric(commentsFallback?.[1]);

    const hasVideo = Boolean(el.querySelector('video'));
    const hasCarousel = Boolean(
      el.querySelector('.ssplayer-carousel, .feed-shared-document, iframe[title*="document" i]')
    );
    const contentImg = Array.from(
      el.querySelectorAll(
        '.update-components-image img, .ivm-view-attr__img--centered, img[src*="media.licdn.com/dms/image"]'
      )
    ).find((img) => !(img.src || '').includes('profile-displayphoto'));

    return {
      platform: 'linkedin',
      postUrl,
      externalId: urn || null,
      authorName,
      authorHandle,
      captionText: captionText.slice(0, 4000),
      mediaType: hasVideo ? 'video' : hasCarousel ? 'carousel' : contentImg ? 'image' : 'text',
      mediaUrl: contentImg?.src || null,
      likesCount,
      commentsCount,
    };
  }

  function hasAncestorInSet(el, ancestorSet) {
    let cur = el.parentElement;
    while (cur) {
      if (ancestorSet.has(cur)) return true;
      cur = cur.parentElement;
    }
    return false;
  }

  function extractLinkedIn(mode) {
    const url = window.location.href;
    const posts = [];
    const seen = new Set();
    const extractedContainers = new Set();

    // Camada 1: Containers conhecidos (Feed, Perfis e Saved Posts 2025/2026)
    const containers = Array.from(
      document.querySelectorAll(
        '[data-chameleon-result-urn], div.feed-shared-update-v2, [data-view-name="feed-full-update"], li.reusable-search__result-container, div.entity-result, div[data-urn*="activity"], div[data-urn*="ugcPost"], div[data-id*="urn:li:activity"], div[data-id*="urn:li:ugcPost"], main article, ul.reusable-search__entity-result-list > li'
      )
    );

    for (const el of containers) {
      if (hasAncestorInSet(el, extractedContainers)) continue;
      const post = extractPostFromLinkedInContainer(el, seen, null);
      if (post) {
        posts.push(post);
        extractedContainers.add(el);
      }
    }

    // Camada 2: Fallback por links diretos de post caso as classes tenham sido ofuscadas
    const postLinks = Array.from(
      document.querySelectorAll(
        'a[href*="/feed/update/"], a[href*="/posts/"], a[href*="urn:li:activity"], a[href*="urn:li:ugcPost"]'
      )
    );

    if (posts.length === 0) {
      for (const link of postLinks) {
        let card = link.closest('li, [role="listitem"], [data-chameleon-result-urn], article, section > div');
        if (!card || card === document.body || card.tagName === 'MAIN') {
          let cur = link.parentElement;
          card = null;
          for (let depth = 0; depth < 5 && cur && cur !== document.body && cur.tagName !== 'MAIN'; depth++) {
            const len = (cur.innerText || '').trim().length;
            if (len >= 30 && len <= 6000) {
              card = cur;
              break;
            }
            cur = cur.parentElement;
          }
        }
        if (!card || hasAncestorInSet(card, extractedContainers)) continue;
        const post = extractPostFromLinkedInContainer(card, seen, link.href.split('?')[0]);
        if (post) {
          posts.push(post);
          extractedContainers.add(card);
        }
      }
    }

    // Camada 3: Fallback específico para Salvos sem href direto ou página de post único
    if (posts.length === 0) {
      if (url.includes('/my-items/saved-posts')) {
        const savedCandidates = Array.from(document.querySelectorAll('main [role="listitem"], main ul > li'));
        for (const item of savedCandidates) {
          if (cleanLinkedInText(item.innerText || '').length < 25) continue;
          if (!item.querySelector('a[href*="/in/"], a[href*="/company/"], a[href*="linkedin.com"]')) continue;
          const post = extractPostFromLinkedInContainer(item, seen, null);
          if (post) posts.push(post);
        }
      } else if (url.includes('/posts/') || url.includes('/feed/update/')) {
        const mainEl = document.querySelector('main');
        const post = extractPostFromLinkedInContainer(mainEl, seen, url.split('?')[0]);
        if (post) posts.push(post);
      }
    }

    // Extract current profile metadata when in profile/radar mode
    let profile = null;
    if (mode === 'radar') {
      const m = url.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/i);
      const handle = m ? m[1] : posts[0]?.authorHandle || 'linkedin_creator';
      const titleEl = document.querySelector('h1');
      profile = {
        platform: 'linkedin',
        handle,
        displayName: titleEl?.innerText?.trim() || handle,
        profileUrl: url.split('?')[0],
      };
    }

    const result = { source: mode, profile, posts: posts.slice(0, 25) };
    if (result.posts.length === 0) {
      result.debug = `${window.location.pathname} (containers=${containers.length}, links=${postLinks.length})`;
    }
    return result;
  }

  function extractInstagram(mode) {
    const url = window.location.href;
    const posts = [];
    const seen = new Set();

    // 1. If a modal/single post or reel is currently open, capture full caption and metrics
    const article = document.querySelector('article[role="presentation"], main article');
    if (article && (url.includes('/p/') || url.includes('/reel/') || document.querySelector('div[role="dialog"] article'))) {
      const linkAnchor = document.querySelector('a[href*="/p/"], a[href*="/reel/"]');
      const postUrl = (url.includes('/p/') || url.includes('/reel/'))
        ? url.split('?')[0]
        : (linkAnchor ? linkAnchor.href.split('?')[0] : null);

      const h1 = article.querySelector('h1');
      const spans = Array.from(article.querySelectorAll('span[dir="auto"]'))
        .map((s) => s.innerText?.trim() || '')
        .filter((t) => t.length > 20);
      const captionText = (h1?.innerText?.trim() || spans[0] || '').trim();

      const headerAuthor = article.querySelector('header a[href^="/"]');
      const authorHandle = headerAuthor?.innerText?.trim()?.replace(/^@/, '') || null;

      const textDump = article.innerText || '';
      const likeMatch = textDump.match(/([\d.,]+\s*(?:mil|k|m)?)\s*(?:curtidas|likes)/i);

      if (captionText || postUrl) {
        const key = postUrl || captionText.slice(0, 80);
        seen.add(key);
        posts.push({
          platform: 'instagram',
          postUrl,
          authorHandle,
          authorName: authorHandle,
          captionText: captionText || `Post do Instagram (${postUrl})`,
          mediaType: (postUrl && postUrl.includes('/reel/')) || article.querySelector('video') ? 'reel' : 'image',
          likesCount: likeMatch ? parseMetric(likeMatch[1]) : 0,
          commentsCount: 0,
        });
      }
    }

    // 2. Capture visible grid tiles (Saved collections or Profile grid)
    const anchors = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
    for (const a of anchors) {
      const postUrl = a.href.split('?')[0];
      if (!postUrl || seen.has(postUrl)) continue;
      seen.add(postUrl);

      const img = a.querySelector('img');
      const altText = (img?.getAttribute('alt') || '').trim();
      const overlayText = (a.innerText || '').trim();
      const isReel = postUrl.includes('/reel/') || Boolean(a.querySelector('svg[aria-label*="Reel"], svg[aria-label*="Clipe"], svg[aria-label*="Vídeo"]'));
      const isCarousel = Boolean(a.querySelector('svg[aria-label*="Carrossel"], svg[aria-label*="Carousel"]'));

      // Extract inline hover counters if visible in tile
      const numbers = overlayText
        .split(/\s+/)
        .map(parseMetric)
        .filter((n) => n > 0);

      posts.push({
        platform: 'instagram',
        postUrl,
        captionText: altText || `Post capturado do Instagram (${postUrl})`,
        mediaType: isReel ? 'reel' : isCarousel ? 'carousel' : 'image',
        mediaUrl: img?.src || null,
        likesCount: numbers[0] || 0,
        commentsCount: numbers[1] || 0,
      });
    }

    let profile = null;
    if (mode === 'radar') {
      const m = url.match(/instagram\.com\/([^/?#]+)/i);
      const rawHandle = m ? m[1] : '';
      const ignored = ['saved', 'explore', 'reels', 'direct', 'p', 'reel', 'stories'];
      const handle = ignored.includes(rawHandle.toLowerCase()) ? '' : rawHandle;
      if (handle) {
        const headerTitle = document.querySelector('header h2, header h1');
        profile = {
          platform: 'instagram',
          handle,
          displayName: headerTitle?.innerText?.trim() || handle,
          profileUrl: `https://www.instagram.com/${handle}/`,
        };
      }
    }

    return { source: mode, profile, posts: posts.slice(0, 30) };
  }

  window.__createflowExtractPage = (mode) => {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('linkedin.com')) {
      return extractLinkedIn(mode);
    }
    if (host.includes('instagram.com')) {
      return extractInstagram(mode);
    }
    return { source: mode, posts: [], error: 'Abra uma página do LinkedIn ou Instagram para capturar.' };
  };
})();
