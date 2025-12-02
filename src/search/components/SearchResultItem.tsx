import {
  Avatar,
  Flex,
  IconName,
  TagList,
  type TagOption,
  Thumbnail,
} from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import { compact, isNil, trimStart } from 'es-toolkit'
import { type FC } from 'react'

import { CONTENT_TYPE_TRANSLATIONS_NL_TO_EN } from '../../collection/collection.types';
import { SearchResult } from '../../shared/components/SearchResult/SearchResult';
import { formatDate } from '../../shared/helpers/formatters/date';
import { tText } from '../../shared/helpers/translate-text';
import { type SearchResultItemProps } from '../search.types';

import './SearchResultItem.scss'

export const SearchResultItem: FC<SearchResultItemProps> = ({
  id,
  handleBookmarkToggle,
  handleTagClicked,
  result,
  isBookmarked,
  qualityLabelLookup,
  bookmarkButton,
  renderDetailLink,
  renderSearchLink,
}) => {
  const getTags = (
    result: Avo.Search.ResultItem,
  ): { typeTags: TagOption[]; qualityTags: TagOption[] } => {
    const qualityLabels = compact(result?.collection_labels || []) as string[]
    const assignmentTypeLabels = compact(
      result?.lom_learning_resource_type || [],
    ).sort()

    const TAG_TRANSLATIONS: Record<string, string> = {
      PARTNER: tText('search/components/search-result-item___partner'),
      REDACTIE: tText(
        'search/components/search-result-item___keuze-van-de-redactie',
      ),
      UITGEVERIJ: tText('search/components/search-result-item___uitgeverij'),
      KIJK: tText('search/components/search-result-item___kijken-en-luisteren'),
      ZOEK: tText('search/components/search-result-item___zoeken'),
      BOUW: tText('search/components/search-result-item___zoek-en-bouw'),
    }

    const TAG_LOGO: Record<string, IconName | undefined> = {
      PARTNER: undefined,
      REDACTIE: undefined,
      UITGEVERIJ: undefined,
      KIJK: IconName.viewAndListen,
      ZOEK: IconName.search2,
      BOUW: IconName.collection2,
    }

    return {
      typeTags: compact(
        assignmentTypeLabels.map((id: string) => ({
          id,
          label: TAG_TRANSLATIONS[id.toUpperCase()],
          icon: TAG_LOGO[id],
          className: 'c-search-result-item__assignment-label-tag',
        })),
      ),
      qualityTags: compact(
        qualityLabels.map((id: string) => ({
          id,
          label: qualityLabelLookup[id] || TAG_TRANSLATIONS[id.toUpperCase()],
          icon: TAG_LOGO[id],
          className: 'c-search-result-item__quality-label-tag',
        })),
      ),
    }
  }

  const getMetaData = () => {
    if (
      result.administrative_type === 'video' ||
      result.administrative_type === 'audio'
    ) {
      const duration = trimStart(result.duration_time, '0:')
      if (duration.includes(':')) {
        return duration
      }
      return `0:${duration}`
    }
    return '' // TODO wait for https://meemoo.atlassian.net/browse/AVO-1107
  }

  const stripMarkdownLinks = (description: string) => {
    return description.replace(/\[([^\]]+)]\([^)]+\)/gi, '$1')
  }

  const renderThumbnail = (result: Avo.Search.ResultItem) => {
    return (
      <Thumbnail
        category={
          CONTENT_TYPE_TRANSLATIONS_NL_TO_EN[result.administrative_type]
        }
        src={result.thumbnail_path}
        label={result.administrative_type}
        meta={getMetaData()}
      />
    )
  }
  const isItem = (result: Avo.Search.ResultItem): boolean => {
    return !['collectie', 'bundel', 'opdracht'].includes(
      result.administrative_type,
    )
  }

  const renderAuthorOrOrganizationWithQualityTags = (
    result: Avo.Search.ResultItem,
  ) => {
    if (!isItem(result)) {
      const name = `${result.owner?.firstname || ''} ${result.owner?.lastname || ''}`
      const initials = `${result.owner?.firstname?.[0] || ''}${
        result.owner?.lastname?.[0] || ''
      }`
      const qualityTags = getTags(result).qualityTags

      return (
        <Flex spaced="wide">
          <Avatar
            image={
              result.owner?.company_avatar_path ||
              result.owner?.avatar_path ||
              undefined
            }
            name={name}
            initials={initials.toLocaleUpperCase()}
            size={isNil(result.owner?.avatar_path) ? 'small' : undefined}
            dark
          />
          <TagList
            className="c-search_result__quality-tags"
            tags={qualityTags}
            swatches={false}
            selectable={false}
          />
        </Flex>
      )
    }

    if (result.original_cp) {
      return renderSearchLink(
        result.original_cp,
        { filters: { provider: [result.original_cp] } },
        'c-body-2',
      )
    }

    return null
  }

  let date: string
  let dateTooltip: string
  if (!isItem(result)) {
    date = result.updated_at
    dateTooltip = tText(
      'search/components/search-result-item___laatst-bijwerking',
    )
  } else {
    date = result.dcterms_issued
    dateTooltip = tText('search/components/search-result-item___uitzend-datum')
  }

  return (
    <div id={`search-result-${id}`} key={`search-result-${id}`}>
      <SearchResult
        type={CONTENT_TYPE_TRANSLATIONS_NL_TO_EN[result.administrative_type]}
        date={formatDate(date)}
        dateTooltip={dateTooltip}
        typeTags={getTags(result).typeTags}
        viewCount={result.views_count || 0}
        bookmarkCount={bookmarkButton ? result.bookmarks_count || 0 : null}
        loms={result.lom_context ?? []}
        description={stripMarkdownLinks(result.dcterms_abstract || '')}
        isBookmarked={bookmarkButton ? isBookmarked : null}
        onToggleBookmark={(active: boolean) =>
          handleBookmarkToggle(result.uid, active)
        }
        onTagClicked={handleTagClicked}
        title={renderDetailLink(
          result.dc_title,
          result.external_id || result.uid || result.id,
          result.administrative_type,
        )}
        subTitle={renderAuthorOrOrganizationWithQualityTags(result)}
        thumbnail={renderDetailLink(
          renderThumbnail(result),
          result.external_id || result.uid || result.id,
          result.administrative_type,
        )}
      />
    </div>
  )
}
