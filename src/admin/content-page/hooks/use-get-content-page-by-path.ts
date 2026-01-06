import { ContentPageInfo } from '@meemoo/admin-core-ui/admin';
import {
  ContentPageService,
  convertDbContentPageToContentPageInfo,
} from '@meemoo/admin-core-ui/client';
import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../../../shared/constants/query-keys';
import { Locale } from '../../../shared/translations/translations.types';

/**
 * Fetches a content page by its path.
 * @param path
 * @param headers headers to pass along to the proxy when making the request (optional for client requests, only needed for ssr)
 */
export async function getContentPageByPath(
  path: string | undefined,
  headers: Record<string, string> = {},
): Promise<ContentPageInfo | null> {
  if (!path) {
    return null;
  }
  const dbContentPage =
    await ContentPageService.getContentPageByLanguageAndPath(
      Locale.Nl as any,
      path,
      false,
      headers,
    );
  if (!dbContentPage) {
    return null;
  }
  return convertDbContentPageToContentPageInfo(dbContentPage);
}

export const useGetContentPageByPath = (
  path: string | undefined,
  options: { enabled?: boolean; initialData?: any } = {},
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONTENT_PAGE_BY_PATH],
    queryFn: async () => getContentPageByPath(path),
    enabled: true,
    ...options,
  });
};
