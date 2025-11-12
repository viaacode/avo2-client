import {
  ContentPageService,
  convertDbContentPageToContentPageInfo,
} from '@meemoo/admin-core-ui/client'
import { useQuery } from '@tanstack/react-query'

import { QUERY_KEYS } from '../../../shared/constants/query-keys.js'
import { Locale } from '../../../shared/translations/translations.types.js'

export const useGetContentPageByPath = (
  path: string | undefined,
  options: { enabled?: boolean } = {},
) => {
  return useQuery({
    queryKey: [QUERY_KEYS.GET_CONTENT_PAGE_BY_PATH],
    queryFn: async () => {
      if (!path) {
        return null
      }
      const dbContentPage =
        await ContentPageService.getContentPageByLanguageAndPath(
          Locale.Nl as any,
          path,
        )
      if (!dbContentPage) {
        return null
      }
      return convertDbContentPageToContentPageInfo(dbContentPage)
    },
    enabled: true,
    ...options,
  })
}
