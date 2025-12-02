import {
  Button,
  Container,
  Form,
  FormGroup,
  IconName,
  Navbar,
  Select,
  Spacer,
  TextInput,
  Toolbar,
  ToolbarItem,
  ToolbarLeft,
  ToolbarRight,
  useKeyPress,
} from '@viaa/avo2-components';
import { Avo, PermissionName } from '@viaa/avo2-types';
import {
  cloneDeep,
  intersection,
  isEqual,
  isNil,
  isPlainObject,
  omit,
  pickBy,
} from 'es-toolkit';
import { every, isEmpty, set } from 'es-toolkit/compat';
import { useAtomValue, useSetAtom } from 'jotai';
import { type FC, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { CustomError } from '../../shared/helpers/custom-error';
import { navigate } from '../../shared/helpers/link';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { tHtml } from '../../shared/helpers/translate-html';
import { tText } from '../../shared/helpers/translate-text';
import { useQualityLabels } from '../../shared/hooks/useQualityLabels';
import {
  CONTENT_TYPE_TO_EVENT_CONTENT_TYPE,
  CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED,
} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.const';
import { BookmarksViewsPlaysService } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service';
import {
  type BookmarkRequestInfo,
  type BookmarkStatusLookup,
} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { ToastService } from '../../shared/services/toast-service';
import { UrlUpdateType } from '../../shared/types/use-query-params.ts';
import { isEducationalUser } from '../../user-item-request-form/helpers/is-educational-user';
import {
  DEFAULT_FILTER_STATE,
  DEFAULT_SORT_ORDER,
  GET_SEARCH_ORDER_OPTIONS,
  ITEMS_PER_PAGE,
  SearchFilter,
  type SearchOrderProperty,
} from '../search.const';
import { getSearchResultsAtom, searchAtom } from '../search.store';
import {
  type FilterState,
  type SearchFilterFieldValues,
  type SearchFilterMultiOptions,
  type SearchFiltersAndResultsProps,
  type SearchState,
} from '../search.types';
import { SearchFilterControls } from './SearchFilterControls';
import { SearchResults } from './SearchResults';

export const SearchFiltersAndResults: FC<SearchFiltersAndResultsProps> = ({
  enabledFilters,
  enabledTypeOptions,
  enabledOrderProperties,
  bookmarks,
  filterState,
  setFilterState,
  renderDetailLink,
  renderSearchLink,
}) => {
  const navigateFunc = useNavigate();

  const searchState: SearchState = useAtomValue(searchAtom);
  const searchResults = searchState.data;
  const commonUser = useAtomValue(commonUserAtom);
  const search = useSetAtom(getSearchResultsAtom);
  const searchResultsLoading = searchState.loading;
  const searchResultsError = searchState.error;
  const resultsCount = searchResults?.count ?? 0;

  const urlUpdateType: UrlUpdateType = UrlUpdateType.PUSH;

  const [searchTerms, setSearchTerms] = useState('');
  const [bookmarkStatuses, setBookmarkStatuses] =
    useState<BookmarkStatusLookup | null>(null);

  const { data: allQualityLabels } = useQualityLabels(
    !enabledFilters || enabledFilters?.includes('collectionLabel'),
  );

  const navigateToItemRequestForm = () => {
    if (isEducationalUser(commonUser)) {
      navigate(navigateFunc, APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route);
    } else {
      navigate(navigateFunc, APP_PATH.USER_ITEM_REQUEST_FORM.route);
    }

    window.scrollTo(0, 0);
  };

  const defaultOrder = `${filterState.orderProperty || 'relevance'}_${
    filterState.orderDirection || Avo.Search.OrderDirection.DESC
  }`;
  const hasFilters = !isEqual(filterState.filters, DEFAULT_FILTER_STATE);
  const resultStart = (filterState.page || 0) * ITEMS_PER_PAGE + 1;
  const resultEnd = Math.min(resultStart + ITEMS_PER_PAGE - 1, resultsCount);

  const [multiOptions, setMultiOptions] = useState(
    {} as SearchFilterMultiOptions,
  );

  useEffect(() => {
    setSearchTerms(filterState?.filters?.query ?? '');
  }, [filterState?.filters?.query]);

  /**
   * Update the filter values and scroll to the top
   */
  useEffect(() => {
    if (searchResults) {
      // Update the checkbox items and counts
      if (enabledTypeOptions) {
        // Limit the type options
        searchResults.aggregations['type'] = searchResults.aggregations[
          'type'
        ].filter((typeOption) =>
          enabledTypeOptions.includes(
            typeOption.option_name as Avo.Core.ContentType,
          ),
        );
        setMultiOptions(searchResults.aggregations);
      } else {
        // Show all type options
        setMultiOptions(searchResults.aggregations);
      }

      //  Scroll to the first search result
      window.scrollTo(0, 0);
    }
  }, [enabledTypeOptions, searchResults]);

  /**
   * Update the search results when the filterState or the currentPage changes
   */
  const onFilterStateChanged = useCallback(() => {
    const orderProperty: Avo.Search.OrderProperty =
      (filterState.orderProperty as Avo.Search.OrderProperty | undefined) ||
      DEFAULT_SORT_ORDER.orderProperty;

    const orderDirection: Avo.Search.OrderDirection =
      (filterState.orderDirection as Avo.Search.OrderDirection | undefined) ||
      DEFAULT_SORT_ORDER.orderDirection;

    // Limit media types in query
    const copiedFilterState = cloneDeep(filterState);
    if (enabledTypeOptions) {
      if (!copiedFilterState.filters?.type) {
        copiedFilterState.filters = copiedFilterState.filters || {};
        copiedFilterState.filters.type = enabledTypeOptions;
      } else {
        copiedFilterState.filters.type = intersection(
          copiedFilterState.filters?.type,
          enabledTypeOptions,
        );
      }
    }

    search(
      orderProperty,
      orderDirection,
      (filterState.page || 0) * ITEMS_PER_PAGE,
      ITEMS_PER_PAGE,
      cleanupFilterState(copiedFilterState).filters,
      {},
    );
  }, [enabledTypeOptions, filterState, search]);

  const updateSearchTerms = useCallback(() => {
    const query = filterState?.filters?.query ?? '';
    if (query) {
      setSearchTerms(query);
    }
  }, [setSearchTerms, filterState]);

  useEffect(() => {
    onFilterStateChanged();
    updateSearchTerms();
  }, [onFilterStateChanged, updateSearchTerms, commonUser]);

  const getBookmarkStatuses = useCallback(async () => {
    try {
      const results = searchResults?.results;
      const profileId = commonUser?.profileId;

      if (!results || !profileId) {
        // search results or user hasn't been loaded yet
        return;
      }

      const objectInfos = results.map(
        (result: Avo.Search.ResultItem): BookmarkRequestInfo => {
          const type =
            CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED[
              result.administrative_type
            ];
          return {
            type,
            uuid: result.uid,
          };
        },
      );
      setBookmarkStatuses(
        await BookmarksViewsPlaysService.getBookmarkStatuses(
          profileId,
          objectInfos,
        ),
      );
    } catch (err) {
      console.error(
        new CustomError('Failed to get bookmark statuses', err, {
          searchResults,
          commonUser,
        }),
      );
      ToastService.danger(
        tHtml(
          'search/views/search___het-ophalen-van-de-bladwijzer-statusen-is-mislukt',
        ),
      );
    }
  }, [setBookmarkStatuses, searchResults, commonUser]);

  useEffect(() => {
    if (
      PermissionService.hasPerm(commonUser, PermissionName.CREATE_BOOKMARKS)
    ) {
      getBookmarkStatuses();
    }
  }, [getBookmarkStatuses, commonUser]);

  const handleOrderChanged = async (value = 'relevance_desc') => {
    const valueParts: [SearchOrderProperty, Avo.Search.OrderDirection] =
      value.split('_') as [SearchOrderProperty, Avo.Search.OrderDirection];
    setFilterState(
      {
        ...filterState,
        orderProperty: valueParts[0] as SearchOrderProperty,
        orderDirection: valueParts[1] as Avo.Search.OrderDirection,
        page: 0,
      },
      urlUpdateType,
    );
  };

  const cleanupFilterState = (filterState: FilterState): FilterState => {
    return {
      ...filterState,
      filters: pickBy(filterState.filters || {}, (value) => {
        const isEmptyString: boolean = value === '';
        const isUndefinedOrNull: boolean = isNil(value);
        const isEmptyObjectOrArray: boolean =
          (isPlainObject(value) || Array.isArray(value)) && isEmpty(value);
        const isArrayWithEmptyValues: boolean =
          Array.isArray(value) &&
          every(value, (arrayValue) => arrayValue === '');
        const isEmptyRangeObject: boolean =
          isPlainObject(value) && !(value as any).gte && !(value as any).lte;

        return (
          !isEmptyString &&
          !isUndefinedOrNull &&
          !isEmptyObjectOrArray &&
          !isArrayWithEmptyValues &&
          !isEmptyRangeObject
        );
      }),
    };
  };

  const handleFilterFieldChange = async (
    value: SearchFilterFieldValues,
    id: Avo.Search.FilterProp,
  ) => {
    let newFilterState: any;
    if (value) {
      newFilterState = {
        ...filterState,
        filters: {
          ...filterState.filters,
          [id]: value,
          query: searchTerms,
        },
        page: 0,
      };
    } else {
      newFilterState = {
        ...filterState,
        filters: {
          ...filterState.filters,
          [id]: DEFAULT_FILTER_STATE[id],
          query: searchTerms,
        },
        page: 0,
      };
    }
    setFilterState(cleanupFilterState(newFilterState), urlUpdateType);
  };

  const handleTagClicked = (tagId: string) => {
    if (
      (allQualityLabels || []).find(
        (label) => label.value.toLowerCase() === tagId.toLowerCase(),
      )
    ) {
      setFilterState(
        {
          ...filterState,
          filters: {
            ...DEFAULT_FILTER_STATE,
            collectionLabel: [tagId],
          },
          page: 0,
        },
        urlUpdateType,
      );
    }
  };

  const deleteAllFilters = () => {
    const copiedFilterState = cloneDeep(filterState);

    // Only remove filters that are user-editable
    if (enabledFilters) {
      copiedFilterState.filters = omit(
        copiedFilterState.filters || {},
        enabledFilters,
      );
    } else {
      copiedFilterState.filters = {};
    }
    if (copiedFilterState.filters) {
      delete copiedFilterState.filters.query;
    }

    setSearchTerms('');
    setFilterState(copiedFilterState, urlUpdateType);
  };

  const handleBookmarkToggle = async (uuid: string, active: boolean) => {
    try {
      if (!commonUser) {
        console.error('User is not logged in');
        ToastService.danger(
          tHtml(
            'search/components/search-filters-and-results___je-moet-aangemald-zijn-om-een-bookmark-aan-te-maken',
          ),
        );
        return;
      }
      const results = searchResults?.results ?? [];
      const resultItem: Avo.Search.ResultItem | undefined = results.find(
        (result: Avo.Search.ResultItem | undefined) => result?.uid === uuid,
      );
      if (!resultItem) {
        throw new CustomError('Failed to find search result by id');
      }
      const type =
        CONTENT_TYPE_TO_EVENT_CONTENT_TYPE[resultItem.administrative_type];
      await BookmarksViewsPlaysService.toggleBookmark(
        uuid,
        commonUser,
        type,
        !active,
      );

      // Update the local cache of bookmark statuses
      const bookmarkStatusesTemp = cloneDeep(bookmarkStatuses) || {
        item: {},
        collection: {},
        assignment: {},
        quick_lane: {},
      };
      set(bookmarkStatusesTemp, `[${type}][${uuid}]`, active);
      setBookmarkStatuses(bookmarkStatusesTemp);
      ToastService.success(
        active
          ? tHtml('search/views/search___de-bladwijzer-is-aangemaakt')
          : tHtml('search/views/search___de-bladwijzer-is-verwijderd'),
      );
    } catch (err) {
      console.error(
        new CustomError('Failed to toggle bookmark', err, {
          uuid,
          commonUser,
          searchResults,
          isBookmarked: !active,
        }),
      );
      ToastService.danger(
        active
          ? tHtml(
              'search/views/search___het-aanmaken-van-de-bladwijzer-is-mislukt',
            )
          : tHtml(
              'search/views/search___het-verwijderen-van-de-bladwijzer-is-mislukt',
            ),
      );
    }
  };

  /**
   * Only copy search terms when the user clicks the search button or when enter is pressed
   * Otherwise we would trigger a search for every letter that is typed
   */
  const copySearchTermsToFormState = async () => {
    setFilterState(
      {
        ...filterState,
        filters: {
          ...filterState.filters,
          query: searchTerms,
        },
        page: 0,
      },
      urlUpdateType,
    );
  };
  useKeyPress('Enter', copySearchTermsToFormState);

  const renderSearchResults = () => {
    if (searchResultsLoading || (!searchResultsError && !searchResults)) {
      return <FullPageSpinner />;
    }
    if (searchResultsError) {
      return (
        <ErrorView
          message={tHtml(
            'search/views/search___fout-tijdens-ophalen-zoek-resultaten',
          )}
          actionButtons={['home']}
        />
      );
    }
    return (
      <SearchResults
        currentItemIndex={(filterState.page || 0) * ITEMS_PER_PAGE}
        // elasticsearch can only handle 10000 results efficiently
        totalItemCount={resultsCount}
        setCurrentItemIndex={(newCurrentItemIndex: number) =>
          setFilterState({
            ...filterState,
            page: Math.floor(newCurrentItemIndex / ITEMS_PER_PAGE),
          })
        }
        data={searchResults}
        handleBookmarkToggle={handleBookmarkToggle}
        handleTagClicked={
          !enabledFilters || enabledFilters.includes(SearchFilter.keyword)
            ? handleTagClicked
            : undefined
        }
        loading={searchResultsLoading}
        bookmarkStatuses={bookmarkStatuses}
        qualityLabels={allQualityLabels || []}
        navigateUserRequestForm={navigateToItemRequestForm}
        bookmarkButtons={bookmarks}
        renderDetailLink={renderDetailLink}
        renderSearchLink={renderSearchLink}
      />
    );
  };

  const renderSearchInputField = () => {
    return (
      <Form type="inline">
        <FormGroup inlineMode="grow">
          <TextInput
            id="query"
            placeholder={tText('search/views/search___vul-uw-zoekterm-in')}
            value={searchTerms}
            className="c-search-term-input-field"
            icon={IconName.search}
            onChange={setSearchTerms}
          />
        </FormGroup>
        <FormGroup inlineMode="shrink">
          <Button
            label={tText('search/views/search___zoeken')}
            type="primary"
            className="c-search-button"
            onClick={copySearchTermsToFormState}
          />
        </FormGroup>
        {hasFilters && (
          <FormGroup inlineMode="shrink">
            <Button
              label={
                isMobileWidth()
                  ? ''
                  : tText('search/views/search___verwijder-alle-filters')
              }
              ariaLabel={tText('search/views/search___verwijder-alle-filters')}
              icon={isMobileWidth() ? IconName.delete : undefined}
              type={isMobileWidth() ? 'borderless' : 'link'}
              onClick={deleteAllFilters}
            />
          </FormGroup>
        )}
      </Form>
    );
  };

  const renderSortControl = () => {
    return (
      <Form type="inline">
        <FormGroup
          label={tText('search/views/search___sorteer-op')}
          labelFor="sortBy"
        >
          <Select
            className="c-search-view__sort-select"
            id="sortBy"
            options={GET_SEARCH_ORDER_OPTIONS().filter(
              (option) =>
                !enabledOrderProperties ||
                enabledOrderProperties.includes(option.value),
            )}
            value={defaultOrder}
            onChange={(value) => handleOrderChanged(value)}
          />
        </FormGroup>
      </Form>
    );
  };

  const renderSearchPage = () => (
    <div className="c-search-view">
      <Navbar autoHeight>
        <Container mode="horizontal">
          <Spacer margin="top-large">
            <Spacer margin="bottom-large">
              <div className="u-limit-width-bp3">
                {renderSearchInputField()}
              </div>
            </Spacer>
            <SearchFilterControls
              filterState={filterState.filters || DEFAULT_FILTER_STATE}
              handleFilterFieldChange={handleFilterFieldChange}
              multiOptions={multiOptions}
              enabledFilters={enabledFilters}
              collectionLabels={allQualityLabels || []}
            />
          </Spacer>
        </Container>
      </Navbar>
      <Container mode="horizontal" className="c-search-view__sort-and-count">
        <Toolbar>
          <ToolbarLeft>
            <ToolbarItem>
              <span className="u-text-muted">
                {resultStart}-{resultEnd} van {resultsCount} resultaten
              </span>
            </ToolbarItem>
          </ToolbarLeft>
          <ToolbarRight>{renderSortControl()}</ToolbarRight>
        </Toolbar>
      </Container>
      {renderSearchResults()}
    </div>
  );

  return renderSearchPage();
};
