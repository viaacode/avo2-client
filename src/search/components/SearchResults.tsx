import { PaginationBar } from '@meemoo/react-components'
import {
  Blankslate,
  Box,
  Button,
  Container,
  Flex,
  IconName,
} from '@viaa/avo2-components'
import { type Avo, PermissionName } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import { isNil } from 'es-toolkit'
import React, { type FC } from 'react'

import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts.js'
import placeholderImage from '../../assets/images/assignment-placeholder.png'
// eslint-disable-next-line import/no-unresolved
import TeacherSvg from '../../assets/images/leerkracht.svg?react'
import { commonUserAtom } from '../../authentication/authentication.store.js'
import { PermissionService } from '../../authentication/helpers/permission-service.js'
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner.js'
import { tHtml } from '../../shared/helpers/translate-html.js'
import { tText } from '../../shared/helpers/translate-text.js'
import { CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.const.js'
import { ITEMS_PER_PAGE } from '../search.const.js'
import { type SearchResultsProps } from '../search.types.js'

import { SearchResultItem } from './SearchResultItem.js'

export const SearchResults: FC<SearchResultsProps> = ({
  loading,
  data,
  currentItemIndex,
  totalItemCount,
  setCurrentItemIndex,
  bookmarkStatuses,
  navigateUserRequestForm,
  bookmarkButtons,
  renderDetailLink,
  renderSearchLink,
  qualityLabels,
  ...resultProps
}) => {
  const commonUser = useAtomValue(commonUserAtom)

  const getIsBookmarked = (result: Avo.Search.ResultItem) => {
    if (!bookmarkStatuses) {
      return null
    }

    return (
      bookmarkStatuses[
        CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED[
          result.administrative_type
        ]
      ][result.uid] || false
    )
  }

  const renderSearchResultItem = (result: Avo.Search.ResultItem) => {
    const searchResult = { ...result }

    if (
      result.administrative_type === 'opdracht' &&
      isNil(searchResult.thumbnail_path)
    ) {
      searchResult.thumbnail_path = placeholderImage
    }

    return (
      <SearchResultItem
        {...resultProps}
        id={result.uid}
        key={`search-result-item-${result.uid}`}
        result={searchResult}
        qualityLabelLookup={Object.fromEntries(
          qualityLabels.map((item) => [item.value, item.description]),
        )}
        isBookmarked={getIsBookmarked(result)}
        bookmarkButton={bookmarkButtons}
        renderDetailLink={renderDetailLink}
        renderSearchLink={renderSearchLink}
      />
    )
  }

  const renderTooManyResults = () => {
    const currentPage = currentItemIndex / ITEMS_PER_PAGE
    if (totalItemCount <= 10000 || currentPage < 999) {
      return null
    }

    return (
      <Box backgroundColor="gray" className="c-search-too-many-results">
        <Flex
          orientation="horizontal"
          center
          spaced="wide"
          className="u-padding-left-xl u-padding-right-xl"
        >
          <TeacherSvg
            className="u-padding-left-xl"
            style={{ height: '16rem' }}
          />
          <h3
            className="c-search-result__title u-padding-left-l u-padding-right-xl"
            style={{ alignSelf: 'center' }}
          >
            {tText(
              'search/components/search-results___er-zijn-te-veel-resultaten-bij-deze-zoekopdracht-verfijn-je-vraag-via-de-zoekbalk-of-de-filters',
            )}
          </h3>
        </Flex>
      </Box>
    )
  }

  const renderResultsOrNoResults = () => {
    if (loading) {
      return <FullPageSpinner />
    }
    if (data && data.results && data.count !== 0) {
      return (
        <>
          <ul className="c-search-result-list">
            {data.results.map(renderSearchResultItem)}
            {renderTooManyResults()}
          </ul>
          <PaginationBar
            className="u-m-t-l u-m-b-l"
            {...GET_DEFAULT_PAGINATION_BAR_PROPS()}
            startItem={currentItemIndex}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={Math.min(totalItemCount, 10000)}
            visualTotalItems={totalItemCount}
            onPageChange={(newPage: number) =>
              setCurrentItemIndex(newPage * ITEMS_PER_PAGE)
            }
          />
        </>
      )
    }
    if (
      PermissionService.hasPerm(
        commonUser,
        PermissionName.REQUEST_MEDIA_ITEM_IN_SEARCH,
      )
    ) {
      // Not pupils
      return (
        <Blankslate
          body=""
          icon={IconName.search}
          title={tHtml(
            'search/components/search-results___er-zijn-geen-zoekresultaten-die-voldoen-aan-uw-filters',
          )}
        >
          <Button
            label={tText(
              'search/components/search-results___vraag-een-item-aan',
            )}
            onClick={navigateUserRequestForm}
          />
        </Blankslate>
      )
    } else {
      // Pupils
      return (
        <Blankslate
          body=""
          icon={IconName.search}
          title={tHtml(
            'search/components/search-results___we-vonden-jammer-genoeg-geen-resultaten-voor-jouw-zoekopdracht-probeer-een-andere-schrijfwijze-of-een-synoniem-of-beperk-het-aantal-filters',
          )}
        />
      )
    }
  }

  return (
    <Container mode="vertical">
      <Container mode="horizontal">{renderResultsOrNoResults()}</Container>
    </Container>
  )
}
