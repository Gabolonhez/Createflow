/* CreateFlow DOM Extractor for LinkedIn & Instagram Web */
(() => {
  if (window.__createflowExtractPage) return;

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

  function extractLinkedIn(mode) {
    const url = window.location.href;
    const posts = [];
    const seen = new Set();

    // 1. Saved items cards OR feed updates OR recent-activity posts
    const containers = Array.from(
      document.querySelectorAll(
        'div.feed-shared-update-v2, li.reusable-search__result-container, div.entity-result, div[data-urn*="activity"]'
      )
    );

    for (const el of containers) {
      const textEl = el.querySelector(
        '.update-components-text, .feed-shared-update-v2__description, .entity-result__summary, .break-words'
      );
      const captionText = (textEl?.innerText || el.innerText || '')
        .replace(/\s+\n/g, '\n')
        .trim();
      if (!captionText || captionText.length < 15) continue;

      const linkEl = el.querySelector(
        'a[href*="/feed/update/"], a[href*="/posts/"], a.app-aware-link[href*="linkedin.com"]'
      );
      let postUrl = linkEl ? linkEl.href.split('?')[0] : null;
      const urn = el.getAttribute('data-urn');
      if (!postUrl && urn) {
        postUrl = `https://www.linkedin.com/feed/update/${urn}/`;
      }

      const dedupeKey = postUrl || captionText.slice(0, 80);
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);

      const authorEl = el.querySelector(
        '.update-components-actor__name span[aria-hidden="true"], .entity-result__title-text a, .feed-shared-actor__name'
      );
      const authorName = (authorEl?.innerText || '').split('\n')[0].trim() || null;

      const profileLinkEl = el.querySelector('a[href*="/in/"], a[href*="/company/"]');
      let authorHandle = null;
      if (profileLinkEl?.href) {
        const m = profileLinkEl.href.match(/linkedin\.com\/(?:in|company)\/([^/?#]+)/i);
        if (m) authorHandle = m[1];
      }

      const likesEl = el.querySelector(
        '.social-details-social-counts__reactions-count, button[aria-label*="reaç"], button[aria-label*="like"]'
      );
      const commentsEl = el.querySelector(
        '.social-details-social-counts__comments, button[aria-label*="coment"], button[aria-label*="comment"]'
      );

      const hasVideo = Boolean(el.querySelector('video'));
      const hasCarousel = Boolean(
        el.querySelector('.ssplayer-carousel, .feed-shared-document')
      );
      const hasImage = Boolean(el.querySelector('.update-components-image img, .ivm-view-attr__img--centered'));

      posts.push({
        platform: 'linkedin',
        postUrl,
        externalId: urn || null,
        authorName,
        authorHandle,
        captionText: captionText.slice(0, 4000),
        mediaType: hasVideo ? 'video' : hasCarousel ? 'carousel' : hasImage ? 'image' : 'text',
        likesCount: parseMetric(likesEl?.innerText || likesEl?.getAttribute('aria-label')),
        commentsCount: parseMetric(commentsEl?.innerText || commentsEl?.getAttribute('aria-label')),
      });
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

    return { source: mode, profile, posts: posts.slice(0, 25) };
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
