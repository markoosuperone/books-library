import "server-only";

import { env } from "./env";
import type {
  GoogleBookVolume,
  GoogleBooksResponse,
} from "@/models/booksData";

/**
 * Thin wrapper around the Google Books API.
 *
 * This is deliberately a module constant rather than an environment variable:
 * the host is a fixed public endpoint with no per-environment variant, so
 * making it configurable would add a setting that can only ever be set wrong.
 */
const BASE_URL = "https://www.googleapis.com/books/v1";

/** Default ISR window, in seconds, for reads against the Books API. */
export const DEFAULT_REVALIDATE = 60;

/**
 * Google rejects `maxResults` above 40, and frequently returns fewer than the
 * requested count anyway, so pagination advances by what actually arrived
 * rather than by the requested page size.
 */
const MAX_PAGE_SIZE = 40;

/** Stops `listVolumes` looping if the API keeps returning volumes we have. */
const MAX_PAGES = 10;

/**
 * Observed ceiling on volumes returned in a single response, regardless of the
 * `maxResults` asked for. `getVolumePage` requests one extra item to learn
 * whether a further page exists, so its page size must stay below this.
 */
const OBSERVED_RESPONSE_CAP = 20;

/** Default volumes shown per page. */
export const DEFAULT_PAGE_SIZE = 12;

/** Statuses worth retrying: the Books API returns sporadic 5xx under load. */
const TRANSIENT_STATUSES = new Set([429, 500, 502, 503, 504]);

const RETRY_DELAYS_MS = [300, 900];

type RequestOptions = {
  revalidate?: number;
};

type SearchOptions = RequestOptions & {
  maxResults?: number;
  startIndex?: number;
};

type ListOptions = RequestOptions & {
  /** Upper bound on volumes returned across all pages. */
  limit?: number;
};

type PageOptions = RequestOptions & {
  /** 1-based page number. */
  page?: number;
  pageSize?: number;
};

export type VolumePage = {
  volumes: GoogleBookVolume[];
  page: number;
  pageSize: number;
  hasPrevious: boolean;
  hasNext: boolean;
};

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const buildUrl = (path: string, params: Record<string, string>): string => {
  const url = new URL(`${BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("key", env.API_KEY);

  return url.toString();
};

const requestJson = async <T>(
  path: string,
  params: Record<string, string>,
  revalidate: number
): Promise<T | null> => {
  const url = buildUrl(path, params);

  for (let attempt = 0; ; attempt += 1) {
    try {
      const response = await fetch(url, { next: { revalidate } });

      if (!response.ok) {
        const retryable =
          TRANSIENT_STATUSES.has(response.status) &&
          attempt < RETRY_DELAYS_MS.length;

        if (retryable) {
          await delay(RETRY_DELAYS_MS[attempt]);
          continue;
        }

        throw new Error(`responded ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (attempt < RETRY_DELAYS_MS.length) {
        await delay(RETRY_DELAYS_MS[attempt]);
        continue;
      }

      // Logs `path`, never the built URL - the latter carries the API key.
      console.error(`Google Books request to ${path} failed:`, error);
      return null;
    }
  }
};

const toHttps = (url?: string): string | undefined =>
  url?.replace(/^http:\/\//, "https://");

/**
 * The Books API hands back `http://` cover URLs. Upgrade them here so callers
 * always receive links that match the https host allowlisted in
 * next.config.ts, and that browsers will not block as mixed content once the
 * app is served over TLS.
 */
const withSecureImageLinks = (volume: GoogleBookVolume): GoogleBookVolume => {
  const { imageLinks } = volume.volumeInfo;

  if (!imageLinks) {
    return volume;
  }

  return {
    ...volume,
    volumeInfo: {
      ...volume.volumeInfo,
      imageLinks: {
        smallThumbnail: toHttps(imageLinks.smallThumbnail),
        thumbnail: toHttps(imageLinks.thumbnail),
      },
    },
  };
};

/** Returns one page of matching volumes, or an empty list if the request fails. */
export const searchVolumes = async (
  query: string,
  {
    revalidate = DEFAULT_REVALIDATE,
    maxResults = MAX_PAGE_SIZE,
    startIndex = 0,
  }: SearchOptions = {}
): Promise<GoogleBookVolume[]> => {
  const data = await requestJson<GoogleBooksResponse>(
    "/volumes",
    {
      q: query,
      maxResults: String(Math.min(maxResults, MAX_PAGE_SIZE)),
      startIndex: String(startIndex),
    },
    revalidate
  );

  return (data?.items ?? []).map(withSecureImageLinks);
};

/**
 * Walks pages until `limit` volumes are collected or results run out.
 *
 * The Books API has no way to list everything - `q` is required and there is
 * no wildcard - so the broadest available result set is a paged walk over one
 * broad query.
 */
export const listVolumes = async (
  query: string,
  { limit = 60, revalidate = DEFAULT_REVALIDATE }: ListOptions = {}
): Promise<GoogleBookVolume[]> => {
  const collected: GoogleBookVolume[] = [];
  const seenIds = new Set<string>();
  let startIndex = 0;

  for (let page = 0; page < MAX_PAGES && collected.length < limit; page += 1) {
    const volumes = await searchVolumes(query, {
      revalidate,
      maxResults: MAX_PAGE_SIZE,
      startIndex,
    });

    if (volumes.length === 0) {
      break;
    }

    for (const volume of volumes) {
      // Pages can overlap; duplicate ids would collide as React keys.
      if (!seenIds.has(volume.id)) {
        seenIds.add(volume.id);
        collected.push(volume);
      }
    }

    // Advance by what arrived, not by what was asked for.
    startIndex += volumes.length;
  }

  return collected.slice(0, limit);
};

/** Returns a single volume, or null if it is missing or the request fails. */
export const getVolume = async (
  id: string,
  { revalidate = DEFAULT_REVALIDATE }: RequestOptions = {}
): Promise<GoogleBookVolume | null> => {
  const volume = await requestJson<GoogleBookVolume>(
    `/volumes/${encodeURIComponent(id)}`,
    {},
    revalidate
  );

  return volume ? withSecureImageLinks(volume) : null;
};

/**
 * Fetches a single page of results.
 *
 * `hasNext` comes from over-fetching one volume rather than from the API's
 * `totalItems`, which is unreliable: a query reporting 300 total can return an
 * empty list well before that, which would leave the reader on a dead page.
 */
export const getVolumePage = async (
  query: string,
  {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    revalidate = DEFAULT_REVALIDATE,
  }: PageOptions = {}
): Promise<VolumePage> => {
  const safePage = Math.max(1, Math.floor(page));
  // Leave room for the extra probe volume within one response.
  const safePageSize = Math.min(
    Math.max(1, Math.floor(pageSize)),
    OBSERVED_RESPONSE_CAP - 1
  );

  const volumes = await searchVolumes(query, {
    revalidate,
    maxResults: safePageSize + 1,
    startIndex: (safePage - 1) * safePageSize,
  });

  return {
    volumes: volumes.slice(0, safePageSize),
    page: safePage,
    pageSize: safePageSize,
    hasPrevious: safePage > 1,
    hasNext: volumes.length > safePageSize,
  };
};
