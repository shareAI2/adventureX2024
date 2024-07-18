import {
  Bookmark,
  bookmarkIsCaptured,
  CapturedBookmark,
  DetailedBookmark,
} from '../../shared/bookmark';
import { httpClient } from './http-client';

interface BookmarkRecord {
  ['url']: string;
  ['title']: string;
  ['created_at']: string;
}

interface DetailedBookmarkRecord extends BookmarkRecord {
  ['summary']: string;
  ['cover_url']: string;
}

interface CapturedBookmarkRecord extends DetailedBookmarkRecord {
  ['content']: string;
}

function bookmarkRecordIsDetailed(
  record: BookmarkRecord,
): record is DetailedBookmarkRecord {
  return 'summary' in record && 'cover_url' in record;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function bookmarkRecordIsCaptured(
  record: BookmarkRecord,
): record is CapturedBookmarkRecord {
  return bookmarkRecordIsDetailed(record) && 'content' in record;
}

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const records: BookmarkRecord[] = await httpClient.get('api:bookmarks');
  return records.map(
    (r): Bookmark => ({
      url: r.url,
      title: r.title,
      createdAt: new Date(r.created_at),
    }),
  );
}

export async function searchBookmarks(
  query: string,
): Promise<(Bookmark | DetailedBookmark)[]> {
  const records: (BookmarkRecord | DetailedBookmarkRecord)[] =
    await httpClient.get('api:bookmarks', {
      params: { query, detailed: true },
    });
  return records.map((r): Bookmark | DetailedBookmark => ({
    url: r.url,
    title: r.title,
    createdAt: new Date(r.created_at),
    ...(bookmarkRecordIsDetailed(r) && {
      summary: r.summary,
      screenshot: r.cover_url,
    }),
  }));
}

export async function createBookmarks(
  bookmarks: (Bookmark | CapturedBookmark)[],
): Promise<void> {
  const records = bookmarks.map(
    (b): BookmarkRecord => ({
      ['url']: b.url,
      ['title']: b.title,
      ['created_at']: b.createdAt.toISOString(),
      ...(bookmarkIsCaptured(b) && {
        ['summary']: b.summary,
        ['content']: b.document,
        ['cover_url']: b.screenshot,
      }),
    }),
  );
  await httpClient.post('api:bookmarks', records);
}

export async function updateBookmark(
  url: string,
  payload: Partial<Omit<CapturedBookmark, 'url'>>,
): Promise<void> {
  await httpClient.patch(`api:bookmarks/${url}`, {
    ['title']: payload.title,
    ['content']: payload.document,
    ['cover_url']: payload.screenshot,
  } satisfies Partial<CapturedBookmarkRecord>);
}

export async function deleteBookmark(url: string): Promise<void> {
  await httpClient.delete(`api:bookmarks/${url}`);
}
