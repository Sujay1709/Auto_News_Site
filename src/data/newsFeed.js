// Helpers that adapt the GNews.io API response to the shape the News page
// renders. GNews returns `image` where the UI expects `urlToImage`; otherwise
// the fields line up with what News.jsx already consumed from NewsAPI.

// Map a single GNews article to the UI's article shape.
export function mapArticle(a) {
  return {
    source: { name: a.source?.name || 'Auto News' },
    title: a.title,
    description: a.description,
    url: a.url,
    urlToImage: a.image || null,
    publishedAt: a.publishedAt || '',
  };
}

// Turn a raw GNews response into the feed the page shows. Returns the live
// articles when present, otherwise the supplied fallback with live=false.
export function normalizeFeed(data, fallback) {
  const list = (data?.articles || [])
    .filter((a) => a && a.title && a.title !== '[Removed]')
    .map(mapArticle);
  if (list.length) return { articles: list, live: true };
  return { articles: fallback, live: false };
}
