import { describe, it, expect } from 'vitest';
import { mapArticle, normalizeFeed } from './newsFeed';

const FALLBACK = [{ source: { name: 'Cached' }, title: 'Cached story', urlToImage: null }];

describe('mapArticle', () => {
  it('maps GNews `image` to `urlToImage` and keeps the source name', () => {
    const out = mapArticle({
      title: 'New EV launches',
      description: 'desc',
      url: 'https://example.com/a',
      image: 'https://example.com/a.jpg',
      publishedAt: '2026-06-09T10:00:00Z',
      source: { name: 'DriveTech' },
    });
    expect(out).toEqual({
      source: { name: 'DriveTech' },
      title: 'New EV launches',
      description: 'desc',
      url: 'https://example.com/a',
      urlToImage: 'https://example.com/a.jpg',
      publishedAt: '2026-06-09T10:00:00Z',
    });
  });

  it('defaults a missing image to null and a missing source to "Auto News"', () => {
    const out = mapArticle({ title: 'x', url: 'u' });
    expect(out.urlToImage).toBeNull();
    expect(out.source.name).toBe('Auto News');
  });
});

describe('normalizeFeed', () => {
  it('returns live, mapped articles when the response has stories', () => {
    const data = { articles: [{ title: 'A', image: 'i.jpg', source: { name: 'S' } }] };
    const result = normalizeFeed(data, FALLBACK);
    expect(result.live).toBe(true);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].urlToImage).toBe('i.jpg');
  });

  it('drops empty/placeholder titles', () => {
    const data = { articles: [{ title: '' }, { title: '[Removed]' }, { title: 'Keep', source: {} }] };
    const result = normalizeFeed(data, FALLBACK);
    expect(result.articles).toHaveLength(1);
    expect(result.articles[0].title).toBe('Keep');
  });

  it('falls back to cached headlines (live=false) when there are no articles', () => {
    expect(normalizeFeed({ articles: [] }, FALLBACK)).toEqual({ articles: FALLBACK, live: false });
  });

  it('falls back when the response is malformed', () => {
    expect(normalizeFeed(null, FALLBACK)).toEqual({ articles: FALLBACK, live: false });
  });
});
