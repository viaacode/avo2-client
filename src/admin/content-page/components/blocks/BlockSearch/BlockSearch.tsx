import { BlockHeading } from '@meemoo/admin-core-ui/client'
import {
  Button,
  Container,
  Dropdown,
  DropdownButton,
  DropdownContent,
  IconName,
  MenuSearchResultContent,
  type MenuSearchResultItemInfo,
  Spacer,
  Spinner,
  TextInput,
} from '@viaa/avo2-components'
import { Avo } from '@viaa/avo2-types'
import { useAtom } from 'jotai'
import { isNil } from 'es-toolkit'
import React, {
  type FC,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router'

import { CONTENT_TYPE_TRANSLATIONS_NL_TO_EN } from '../../../../../collection/collection.types';
import { SearchFilter } from '../../../../../search/search.const';
import { fetchSearchResults } from '../../../../../search/search.service';
import { searchAtom } from '../../../../../search/search.store';
import { type SearchState } from '../../../../../search/search.types';
import {
  generateContentLinkString,
  generateSearchLinkString,
} from '../../../../../shared/helpers/link';
import { useDebounce } from '../../../../../shared/hooks/useDebounce';
import { ToastService } from '../../../../../shared/services/toast-service';
import { KeyCode } from '../../../../../shared/types/index';
import './BlockSearch.scss'
import { tHtml } from '../../../../../shared/helpers/translate-html';
import { tText } from '../../../../../shared/helpers/translate-text';

const ITEMS_IN_AUTOCOMPLETE = 5

export const BlockSearch: FC = () => {
  const navigateFunc = useNavigate()

  const [searchState, setSearchState] = useAtom<SearchState>(searchAtom)
  const [searchTerms, setSearchTerms] = useState<string>('')
  const [isAutocompleteSearchOpen, setAutocompleteSearchOpen] =
    useState<boolean>(false)
  const debouncedSearchTerms = useDebounce(searchTerms, 200)

  const refetchSearchResults = useCallback(async () => {
    // Only do initial search after query params have been analysed and have been added to the state
    const filters = { query: debouncedSearchTerms || '' }
    const searchResults = await fetchSearchResults(
      'relevance',
      Avo.Search.OrderDirection.DESC,
      0,
      ITEMS_IN_AUTOCOMPLETE,
      filters,
      {},
    )
    setSearchState({
      ...searchState,
      data: searchResults,
    })
  }, [debouncedSearchTerms, searchState, setSearchState])

  /**
   * Trigger a new call to the backend for getting new search results when the searchTerms change
   */
  useEffect(() => {
    if (debouncedSearchTerms.trim().length > 0) {
      refetchSearchResults()
    }
  }, [refetchSearchResults])

  // Computed
  const autocompleteMenuItems = (
    (searchState?.data?.results || []) as Avo.Search.ResultItem[]
  ).map(
    (searchResult: Avo.Search.ResultItem): MenuSearchResultItemInfo => ({
      label: searchResult.dc_title,
      id: searchResult.external_id,
      key: searchResult.external_id,
      type: CONTENT_TYPE_TRANSLATIONS_NL_TO_EN[
        searchResult.administrative_type
      ],
    }),
  )

  const autocompleteButtonLabel = autocompleteMenuItems.length
    ? 'Alle zoekresultaten'
    : 'Ga naar de zoek pagina'

  // Methods
  const gotoSearchPage = () => {
    navigateFunc(generateSearchLinkString(SearchFilter.query, searchTerms))
  }

  const goToSearchResult = (searchResultId: string | undefined) => {
    if (!isNil(searchResultId)) {
      // Collection ids are numbers and item ids are strings
      const searchResultItem: Avo.Search.ResultItem | undefined = (
        searchState?.data?.results || []
      ).find(
        (searchResult) =>
          searchResult.id === (searchResultId as string).toString(),
      )

      if (searchResultItem) {
        navigateFunc(
          generateContentLinkString(
            searchResultItem.administrative_type,
            searchResultItem.id,
          ),
        )
      } else {
        ToastService.danger(
          tHtml('home/views/home___geen-zoekresultaten-gevonden-met-id-id', {
            id: searchResultId,
          }),
        )
      }
    }
  }

  const handleSearchTermChanged = (searchTerm: string) => {
    setSearchTerms(searchTerm)
    setAutocompleteSearchOpen(true)
  }

  const handleSearchFieldKeyUp = (evt: KeyboardEvent<HTMLInputElement>) => {
    if (evt.keyCode === KeyCode.Enter) {
      gotoSearchPage()
    }
  }

  return (
    <Container mode="horizontal" size="medium" className="m-search-block">
      <Spacer>
        <BlockHeading type="h2" className="u-text-center">
          {tText(
            'home/views/home___vind-alles-wat-je-nodig-hebt-om-je-lessen-te-verrijken',
          )}
        </BlockHeading>
        <div className="u-text-center">
          <Spacer margin="large" className="c-dropdown__wrapper">
            <Dropdown
              triggerWidth="full-width"
              isOpen={isAutocompleteSearchOpen}
              onOpen={() => setAutocompleteSearchOpen(true)}
              onClose={() => setAutocompleteSearchOpen(false)}
              searchMenu
              placement="bottom-start"
            >
              <DropdownButton>
                <TextInput
                  placeholder={tText('home/views/home___vul-een-zoekterm-in')}
                  icon={IconName.search}
                  value={searchTerms}
                  onChange={(searchTerm) => handleSearchTermChanged(searchTerm)}
                  onKeyUp={handleSearchFieldKeyUp}
                />
              </DropdownButton>
              <DropdownContent>
                <div className="c-dropdown-results">
                  {!searchState.data?.results ? (
                    <MenuSearchResultContent
                      menuItems={autocompleteMenuItems}
                      noResultsLabel={tText(
                        'home/views/home___geen-resultaten',
                      )}
                      onClick={(id) => goToSearchResult(id.toString())}
                    />
                  ) : (
                    <Spinner size="large" />
                  )}
                </div>
                <div className="c-menu__footer">
                  <Button
                    block
                    label={autocompleteButtonLabel}
                    onClick={gotoSearchPage}
                    type="secondary"
                  />
                </div>
              </DropdownContent>
            </Dropdown>
          </Spacer>
        </div>
      </Spacer>
    </Container>
  )
}
