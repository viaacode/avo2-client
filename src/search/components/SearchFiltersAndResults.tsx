import {
	Button,
	Container,
	Form,
	FormGroup,
	Navbar,
	Select,
	Spacer,
	Spinner,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	useKeyPress,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { SearchResultItem } from '@viaa/avo2-types/types/search';
import {
	cloneDeep,
	every,
	get,
	isArray,
	isEmpty,
	isEqual,
	isNil,
	isPlainObject,
	pickBy,
	set,
} from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose, Dispatch } from 'redux';
import { UrlUpdateType } from 'use-query-params';

import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { CustomError, isMobileWidth, navigate } from '../../shared/helpers';
import withUser from '../../shared/hocs/withUser';
import { ToastService } from '../../shared/services';
import {
	BookmarksViewsPlaysService,
	CONTENT_TYPE_TO_EVENT_CONTENT_TYPE,
	CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED,
} from '../../shared/services/bookmarks-views-plays-service';
import {
	BookmarkRequestInfo,
	BookmarkStatusLookup,
} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { AppState } from '../../store';
import {
	DEFAULT_FILTER_STATE,
	DEFAULT_SORT_ORDER,
	GET_SEARCH_ORDER_OPTIONS,
	ITEMS_PER_PAGE,
} from '../search.const';
import { fetchSearchResults } from '../search.service';
import {
	FilterState,
	SearchFilterFieldValues,
	SearchFilterMultiOptions,
	SearchFiltersAndResultsProps,
	SearchFiltersAndResultsPropsManual,
} from '../search.types';
import { getSearchResults } from '../store/actions';
import { selectSearchError, selectSearchLoading, selectSearchResults } from '../store/selectors';

import SearchFilterControls from './SearchFilterControls';
import SearchResults from './SearchResults';

const SearchFiltersAndResults: FunctionComponent<SearchFiltersAndResultsProps> = ({
	// Manual props
	enabledFilters,
	bookmarks,
	filterState,
	setFilterState,
	handleSearchResultClicked,

	// Automatically injected props
	searchResults,
	searchResultsLoading,
	searchResultsError,
	search,
	history,
	user,
}) => {
	const [t] = useTranslation();
	const resultsCount = get(searchResults, 'count', 0);

	const urlUpdateType: UrlUpdateType = 'push';

	const [currentPage, setCurrentPage] = useState(0);
	const [searchTerms, setSearchTerms] = useState('');
	const [bookmarkStatuses, setBookmarkStatuses] = useState<BookmarkStatusLookup | null>(null);

	const navigateToUserRequestForm = () =>
		navigate(history, APP_PATH.USER_ITEM_REQUEST_FORM.route);

	const onSearchInSearchFilter = async (id: string) => {
		const orderProperty: Avo.Search.OrderProperty =
			(filterState.orderProperty as Avo.Search.OrderProperty | undefined) ||
			DEFAULT_SORT_ORDER.orderProperty;

		const orderDirection: Avo.Search.OrderDirection =
			(filterState.orderDirection as Avo.Search.OrderDirection | undefined) ||
			DEFAULT_SORT_ORDER.orderDirection;

		const response = await fetchSearchResults(
			orderProperty,
			orderDirection,
			0,
			0, // We are only interested in aggs
			cleanupFilterState(filterState).filters,
			{},
			[id as Avo.Search.FilterProp],
			1000
		);

		setMultiOptions({
			...multiOptions,
			...response.aggregations,
		});
	};
	const defaultOrder = `${filterState.orderProperty || 'relevance'}_${
		filterState.orderDirection || 'desc'
	}`;
	const hasFilters = !isEqual(filterState.filters, DEFAULT_FILTER_STATE);
	// elasticsearch can only handle 10000 results efficiently
	const pageCount = Math.ceil(Math.min(resultsCount, 10000) / ITEMS_PER_PAGE);
	const resultStart = currentPage * ITEMS_PER_PAGE + 1;
	const resultEnd = Math.min(resultStart + ITEMS_PER_PAGE - 1, resultsCount);

	const [multiOptions, setMultiOptions] = useState({} as SearchFilterMultiOptions);

	/**
	 * Update the filter values and scroll to the top
	 */
	useEffect(() => {
		if (searchResults) {
			// Update the checkbox items and counts
			setMultiOptions(searchResults.aggregations);

			//  Scroll to the first search result
			window.scrollTo(0, 0);
		}
	}, [searchResults]);

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

		search(
			orderProperty,
			orderDirection,
			currentPage * ITEMS_PER_PAGE,
			ITEMS_PER_PAGE,
			cleanupFilterState(filterState).filters,
			{}
		);
	}, [filterState, currentPage, search]);

	const updateSearchTerms = useCallback(() => {
		const query = get(filterState, 'filters.query', '');
		if (query) {
			setSearchTerms(query);
		}
	}, [setSearchTerms, filterState]);

	useEffect(() => {
		if (!PermissionService.hasPerm(user, PermissionName.SEARCH)) {
			return;
		}
		onFilterStateChanged();
		updateSearchTerms();
	}, [onFilterStateChanged, updateSearchTerms, user]);

	const getBookmarkStatuses = useCallback(async () => {
		try {
			const results = get(searchResults, 'results');
			const profileId = get(user, 'profile.id');

			if (!results || !profileId) {
				// search results or user hasn't been loaded yet
				return;
			}

			const objectInfos = results.map(
				(result: Avo.Search.ResultItem): BookmarkRequestInfo => {
					const type =
						CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED[result.administrative_type];
					return {
						type,
						uuid: result.uid,
					};
				}
			);
			setBookmarkStatuses(
				await BookmarksViewsPlaysService.getBookmarkStatuses(profileId, objectInfos)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to get bookmark statuses', err, {
					searchResults,
					user,
				})
			);
			ToastService.danger(
				t('search/views/search___het-ophalen-van-de-bladwijzer-statusen-is-mislukt')
			);
		}
	}, [t, setBookmarkStatuses, searchResults, user]);

	useEffect(() => {
		if (PermissionService.hasPerm(user, PermissionName.CREATE_BOOKMARKS)) {
			getBookmarkStatuses();
		}
	}, [getBookmarkStatuses, user]);

	const handleOrderChanged = async (value = 'relevance_desc') => {
		const valueParts: string[] = value.split('_');
		setFilterState(
			{
				...filterState,
				orderProperty: valueParts[0] as Avo.Search.OrderProperty,
				orderDirection: valueParts[1] as Avo.Search.OrderDirection,
			},
			urlUpdateType
		);

		// Reset to page 1 when search is triggered
		setCurrentPage(0);
	};

	const cleanupFilterState = (filterState: FilterState): FilterState => {
		return {
			...filterState,
			filters: pickBy(filterState.filters, (value: string) => {
				const isEmptyString: boolean = value === '';
				const isUndefinedOrNull: boolean = isNil(value);
				const isEmptyObjectOrArray: boolean =
					(isPlainObject(value) || isArray(value)) && isEmpty(value);
				const isArrayWithEmptyValues: boolean =
					isArray(value) && every(value, (arrayValue) => arrayValue === '');
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
		id: Avo.Search.FilterProp
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
			};
		} else {
			newFilterState = {
				...filterState,
				filters: {
					...filterState.filters,
					[id]: DEFAULT_FILTER_STATE[id],
					query: searchTerms,
				},
			};
		}
		setFilterState(cleanupFilterState(newFilterState), urlUpdateType);

		// Reset to page 1 when search is triggered
		setCurrentPage(0);
	};

	const handleTagClicked = (tagId: string) => {
		setFilterState(
			{
				...filterState,
				filters: {
					...DEFAULT_FILTER_STATE,
					collectionLabel: [tagId],
				},
			},
			urlUpdateType
		);
	};

	const handleOriginalCpLinkClicked = async (_id: string, originalCp: string | undefined) => {
		if (originalCp) {
			setFilterState({
				...filterState,
				filters: {
					...DEFAULT_FILTER_STATE,
					provider: [originalCp],
				},
			});
		}
	};

	const deleteAllFilters = () => {
		setSearchTerms('');
		setFilterState({}, urlUpdateType);
	};

	const setPage = async (pageIndex: number): Promise<void> => {
		setCurrentPage(pageIndex);
	};

	const handleBookmarkToggle = async (uuid: string, active: boolean) => {
		try {
			const results = get(searchResults, 'results', []);
			const resultItem: SearchResultItem | undefined = results.find(
				(result) => result.uid === uuid
			);
			if (!resultItem) {
				throw new CustomError('Failed to find search result by id');
			}
			const type = CONTENT_TYPE_TO_EVENT_CONTENT_TYPE[resultItem.administrative_type];
			await BookmarksViewsPlaysService.toggleBookmark(uuid, user, type, !active);

			// Update the local cache of bookmark statuses
			const bookmarkStatusesTemp = cloneDeep(bookmarkStatuses) || {
				item: {},
				collection: {},
			};
			set(bookmarkStatusesTemp, `[${type}][${uuid}]`, active);
			setBookmarkStatuses(bookmarkStatusesTemp);
			ToastService.success(
				active
					? t('search/views/search___de-bladwijzer-is-aangemaakt')
					: t('search/views/search___de-bladwijzer-is-verwijderd')
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle bookmark', err, {
					uuid,
					user,
					searchResults,
					isBookmarked: !active,
				})
			);
			ToastService.danger(
				active
					? t('search/views/search___het-aanmaken-van-de-bladwijzer-is-mislukt')
					: t('search/views/search___het-verwijderen-van-de-bladwijzer-is-mislukt')
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
			},
			urlUpdateType
		);

		// Reset to page 1 when search is triggered
		setCurrentPage(0);
	};
	useKeyPress('Enter', copySearchTermsToFormState);

	const renderSearchResults = () => {
		if (searchResultsLoading) {
			return <Spinner size="large" />;
		}
		if (searchResultsError) {
			return (
				<ErrorView
					message={t('search/views/search___fout-tijdens-ophalen-zoek-resultaten')}
					actionButtons={['home']}
				/>
			);
		}
		return (
			<SearchResults
				currentPage={currentPage}
				data={searchResults}
				handleBookmarkToggle={handleBookmarkToggle}
				handleTagClicked={handleTagClicked}
				handleOriginalCpLinkClicked={handleOriginalCpLinkClicked}
				handleTitleLinkClicked={handleSearchResultClicked}
				handleThumbnailClicked={handleSearchResultClicked}
				loading={searchResultsLoading}
				pageCount={pageCount}
				setPage={setPage}
				bookmarkStatuses={bookmarkStatuses}
				navigateUserRequestForm={navigateToUserRequestForm}
				bookmarkButtons={bookmarks}
			/>
		);
	};

	const renderSearchPage = () => (
		<div className="c-search-view">
			<Navbar autoHeight>
				<Container mode="horizontal">
					<Spacer margin="top-large">
						<Spacer margin="bottom-large">
							<div className="u-limit-width-bp3">
								<Form type="inline">
									<FormGroup inlineMode="grow">
										<TextInput
											id="query"
											placeholder={t(
												'search/views/search___vul-uw-zoekterm-in'
											)}
											value={searchTerms}
											className="c-search-term-input-field"
											icon="search"
											onChange={setSearchTerms}
										/>
									</FormGroup>
									<FormGroup inlineMode="shrink">
										<Button
											label={t('search/views/search___zoeken')}
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
														: t(
																'search/views/search___verwijder-alle-filters'
														  )
												}
												ariaLabel={t(
													'search/views/search___verwijder-alle-filters'
												)}
												icon={isMobileWidth() ? 'trash-2' : undefined}
												type={isMobileWidth() ? 'borderless' : 'link'}
												onClick={deleteAllFilters}
											/>
										</FormGroup>
									)}
								</Form>
							</div>
						</Spacer>
						<SearchFilterControls
							filterState={filterState.filters || DEFAULT_FILTER_STATE}
							handleFilterFieldChange={handleFilterFieldChange}
							multiOptions={multiOptions}
							onSearch={onSearchInSearchFilter}
							enabledFilters={enabledFilters}
						/>
					</Spacer>
				</Container>
			</Navbar>
			<Container mode="horizontal">
				<Toolbar>
					<ToolbarLeft>
						<ToolbarItem>
							<p className="c-body-1 u-text-muted">
								{resultStart}-{resultEnd} van {resultsCount} resultaten
							</p>
						</ToolbarItem>
					</ToolbarLeft>
					<ToolbarRight>
						<Form type="inline">
							<FormGroup
								label={t('search/views/search___sorteer-op')}
								labelFor="sortBy"
							>
								<Select
									className="c-search-view__sort-select"
									id="sortBy"
									options={GET_SEARCH_ORDER_OPTIONS(t)}
									value={defaultOrder}
									onChange={(value) => handleOrderChanged(value)}
								/>
							</FormGroup>
						</Form>
					</ToolbarRight>
				</Toolbar>
			</Container>
			{renderSearchResults()}
		</div>
	);

	return renderSearchPage();
};

const mapStateToProps = (state: AppState) => ({
	searchResults: selectSearchResults(state),
	searchResultsLoading: selectSearchLoading(state),
	searchResultsError: selectSearchError(state),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		search: (
			orderProperty: Avo.Search.OrderProperty,
			orderDirection: Avo.Search.OrderDirection,
			from: number,
			size: number,
			filters?: Partial<Avo.Search.Filters>,
			filterOptionSearch?: Partial<Avo.Search.FilterOption>
		) =>
			dispatch(
				getSearchResults(
					orderProperty,
					orderDirection,
					from,
					size,
					filters,
					filterOptionSearch
				) as any
			),
	};
};

export default compose(
	withRouter,
	withUser,
	connect(mapStateToProps, mapDispatchToProps)
)(SearchFiltersAndResults) as FunctionComponent<SearchFiltersAndResultsPropsManual>;
