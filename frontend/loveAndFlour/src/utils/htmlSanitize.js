const LEGACY_DOMAINS = ['loveandflourbypooja.com'];

function isLegacyUrl(url) {
  try {
    const u = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return LEGACY_DOMAINS.includes(u.hostname);
  } catch {
    return false;
  }
}

function stripScripts(html) {
  const str = String(html ?? '');
  return str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

function rewriteLegacyUrlsRaw(html) {
  let out = String(html ?? '');
  for (const domain of LEGACY_DOMAINS) {
    const re = new RegExp(`https?:\\\\/\\\\/${domain.replace(/\./g, '\\\\.')}`, 'gi');
    out = out.replace(re, '');
  }
  return out;
}

export function sanitizeHtmlForApp(html) {
  const raw = rewriteLegacyUrlsRaw(stripScripts(html));

  // Browser-side: normalize any remaining legacy links more safely with DOM parsing.
  if (typeof DOMParser !== 'undefined') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div id="__root">${raw}</div>`, 'text/html');
    const root = doc.getElementById('__root');
    if (!root) return raw;

    root.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      if (!href) return;
      if (!isLegacyUrl(href)) return;
      try {
        const u = new URL(href, window.location.origin);
        a.setAttribute('href', u.pathname + u.search + u.hash);
      } catch {
        a.setAttribute('href', '/');
      }
      a.removeAttribute('target');
      a.removeAttribute('rel');
    });

    root.querySelectorAll('img[src]').forEach((img) => {
      const src = img.getAttribute('src');
      if (!src) return;
      if (!isLegacyUrl(src)) return;
      try {
        const u = new URL(src, window.location.origin);
        img.setAttribute('src', u.pathname + u.search + u.hash);
      } catch {
        // If we can't parse, drop the image source (prevents leaking to legacy host).
        img.removeAttribute('src');
      }
    });

    // Final safety: drop any scripts that slipped through.
    root.querySelectorAll('script').forEach((s) => s.remove());
    return root.innerHTML;
  }

  return raw;
}

