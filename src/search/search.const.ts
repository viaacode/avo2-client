import { Avo } from '@viaa/avo2-types'

import { tText } from '../shared/helpers/translate-text.js'

import { type SortOrder } from './search.types.js'

export const ITEMS_PER_PAGE = 10

export enum SearchFilter {
  query = 'query',
  type = 'type',
  educationLevel = 'educationLevel',
  educationDegree = 'educationDegree',
  thema = 'thema',
  broadcastDate = 'broadcastDate',
  language = 'language',
  keyword = 'keyword',
  subject = 'subject',
  serie = 'serie',
  provider = 'provider',
  collectionLabel = 'collectionLabel',
  elementary = 'elementary',
}

export const ALL_SEARCH_FILTERS: SearchFilter[] = [
  SearchFilter.query,
  SearchFilter.type,
  SearchFilter.educationLevel,
  SearchFilter.educationDegree,
  SearchFilter.thema,
  SearchFilter.broadcastDate,
  SearchFilter.language,
  SearchFilter.keyword,
  SearchFilter.subject,
  SearchFilter.serie,
  SearchFilter.provider,
  SearchFilter.collectionLabel,
]

export const DEFAULT_FILTER_STATE: Avo.Search.Filters = {
  [SearchFilter.query]: '',
  [SearchFilter.type]: [],
  [SearchFilter.educationLevel]: [],
  [SearchFilter.educationDegree]: [],
  [SearchFilter.thema]: [],
  [SearchFilter.broadcastDate]: {
    gte: '',
    lte: '',
  },
  [SearchFilter.language]: [],
  [SearchFilter.keyword]: [],
  [SearchFilter.subject]: [],
  [SearchFilter.serie]: [],
  [SearchFilter.provider]: [],
  [SearchFilter.collectionLabel]: [],
  [SearchFilter.elementary]: false,
}

export const DEFAULT_SORT_ORDER: SortOrder = {
  orderProperty: 'relevance',
  orderDirection: Avo.Search.OrderDirection.DESC,
}

export enum SearchOrderProperty {
  relevance = 'relevance',
  views = 'views',
  broadcastDate = 'broadcastDate',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum SearchOrderAndDirectionProperty {
  relevanceDesc = 'relevance_desc',
  viewsDesc = 'views_desc',
  broadcastDateDesc = 'broadcastDate_desc',
  broadcastDateAsc = 'broadcastDate_asc',
  createdAtDesc = 'createdAt_desc',
  updatedAtDesc = 'updatedAt_desc',
}

export const GET_SEARCH_ORDER_OPTIONS = (): {
  label: string
  value: SearchOrderAndDirectionProperty
}[] => [
  {
    label: tText('search/views/search___meest-relevant'),
    value: SearchOrderAndDirectionProperty.relevanceDesc,
  },
  {
    label: tText('search/views/search___meest-bekeken'),
    value: SearchOrderAndDirectionProperty.viewsDesc,
  },
  {
    label: tText('search/views/search___uitzenddatum-aflopend'),
    value: SearchOrderAndDirectionProperty.broadcastDateDesc,
  },
  {
    label: tText('search/views/search___uitzenddatum-oplopend'),
    value: SearchOrderAndDirectionProperty.broadcastDateAsc,
  },
  {
    label: tText('search/views/search___laatst-toegevoegd'),
    value: SearchOrderAndDirectionProperty.createdAtDesc,
  },
  {
    label: tText('search/views/search___laatst-gewijzigd'),
    value: SearchOrderAndDirectionProperty.updatedAtDesc,
  },
]
