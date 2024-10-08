import {
	Button,
	Container,
	Flex,
	Form,
	FormGroup,
	IconName,
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
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { type SearchOrderDirection } from '@viaa/avo2-types/types/search';
import {
	cloneDeep,
	every,
	intersection,
	isArray,
	isEmpty,
	isEqual,
	isNil,
	isPlainObject,
	pickBy,
	set,
} from 'lodash-es';
import React, { type FunctionComponent, useCallback, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { compose, type Dispatch } from 'redux';
import { type UrlUpdateType } from 'use-query-params';

import { PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { CustomError, isMobileWidth, navigate } from '../../shared/helpers';
import withUser from '../../shared/hocs/withUser';
import { useQualityLabels } from '../../shared/hooks/useQualityLabels';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	BookmarksViewsPlaysService,
	CONTENT_TYPE_TO_EVENT_CONTENT_TYPE,
	CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED,
} from '../../shared/services/bookmarks-views-plays-service';
import {
	type BookmarkRequestInfo,
	type BookmarkStatusLookup,
} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { ToastService } from '../../shared/services/toast-service';
import { type AppState } from '../../store';
import { isEducationalUser } from '../../user-item-request-form/helpers/is-educational-user';
import {
	DEFAULT_FILTER_STATE,
	DEFAULT_SORT_ORDER,
	GET_SEARCH_ORDER_OPTIONS,
	ITEMS_PER_PAGE,
	SearchFilter,
	type SearchOrderProperty,
} from '../search.const';
import {
	type FilterState,
	type SearchFilterFieldValues,
	type SearchFilterMultiOptions,
	type SearchFiltersAndResultsProps,
	type SearchFiltersAndResultsPropsManual,
} from '../search.types';
import { getSearchResults } from '../store/actions';
import { selectSearchError, selectSearchLoading, selectSearchResults } from '../store/selectors';

import SearchFilterControls from './SearchFilterControls';
import SearchResults from './SearchResults';

const SearchFiltersAndResults: FunctionComponent<SearchFiltersAndResultsProps> = ({
	// Manual props
	enabledFilters,
	enabledTypeOptions,
	enabledOrderProperties,
	bookmarks,
	filterState,
	setFilterState,
	renderDetailLink,
	renderSearchLink,

	// Automatically injected props
	searchResults,
	searchResultsLoading,
	searchResultsError,
	search,
	history,
	user,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();
	const resultsCount = searchResults?.count ?? 0;

	const urlUpdateType: UrlUpdateType = 'push';

	const [searchTerms, setSearchTerms] = useState('');
	const [bookmarkStatuses, setBookmarkStatuses] = useState<BookmarkStatusLookup | null>(null);

	const [qualityLabels] = useQualityLabels(
		!enabledFilters || enabledFilters?.includes('collectionLabel')
	);

	const navigateToItemRequestForm = () => {
		if (isEducationalUser(commonUser)) {
			navigate(history, APP_PATH.EDUCATIONAL_USER_ITEM_REQUEST_FORM.route);
		} else {
			navigate(history, APP_PATH.USER_ITEM_REQUEST_FORM.route);
		}
	};

	const defaultOrder = `${filterState.orderProperty || 'relevance'}_${
		filterState.orderDirection || 'desc'
	}`;
	const hasFilters = !isEqual(filterState.filters, DEFAULT_FILTER_STATE);
	// elasticsearch can only handle 10000 results efficiently
	const pageCount = Math.ceil(Math.min(resultsCount, 10000) / ITEMS_PER_PAGE);
	const resultStart = (filterState.page || 0) * ITEMS_PER_PAGE + 1;
	const resultEnd = Math.min(resultStart + ITEMS_PER_PAGE - 1, resultsCount);

	const [multiOptions, setMultiOptions] = useState({} as SearchFilterMultiOptions);

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
				searchResults.aggregations['type'] = searchResults.aggregations['type'].filter(
					(typeOption) =>
						enabledTypeOptions.includes(typeOption.option_name as Avo.Core.ContentType)
				);
				setMultiOptions(searchResults.aggregations);
			} else {
				// Show all type options
				setMultiOptions(searchResults.aggregations);
			}

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

		// Limit media types in query
		const copiedFilterState = cloneDeep(filterState);
		if (enabledTypeOptions) {
			if (!copiedFilterState.filters?.type) {
				copiedFilterState.filters = copiedFilterState.filters || {};
				copiedFilterState.filters.type = enabledTypeOptions;
			} else {
				copiedFilterState.filters.type = intersection(
					copiedFilterState.filters?.type,
					enabledTypeOptions
				);
			}
		}

		search(
			orderProperty,
			orderDirection,
			(filterState.page || 0) * ITEMS_PER_PAGE,
			ITEMS_PER_PAGE,
			cleanupFilterState(copiedFilterState).filters,
			{}
		);
	}, [filterState, search]);

	const updateSearchTerms = useCallback(() => {
		const query = filterState?.filters?.query ?? '';
		if (query) {
			setSearchTerms(query);
		}
	}, [setSearchTerms, filterState]);

	useEffect(() => {
		onFilterStateChanged();
		updateSearchTerms();
	}, [onFilterStateChanged, updateSearchTerms, user]);

	const getBookmarkStatuses = useCallback(async () => {
		try {
			const results = searchResults?.results;
			const profileId = user?.profile?.id;

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
				tHtml('search/views/search___het-ophalen-van-de-bladwijzer-statusen-is-mislukt')
			);
		}
	}, [tHtml, setBookmarkStatuses, searchResults, user]);

	useEffect(() => {
		if (PermissionService.hasPerm(user, PermissionName.CREATE_BOOKMARKS)) {
			getBookmarkStatuses();
		}
	}, [getBookmarkStatuses, user]);

	const handleOrderChanged = async (value = 'relevance_desc') => {
		const valueParts: [SearchOrderProperty, SearchOrderDirection] = value.split('_') as [
			SearchOrderProperty,
			SearchOrderDirection,
		];
		setFilterState(
			{
				...filterState,
				orderProperty: valueParts[0] as SearchOrderProperty,
				orderDirection: valueParts[1] as Avo.Search.OrderDirection,
				page: 0,
			},
			urlUpdateType
		);
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
		if (qualityLabels.find((label) => label.value.toLowerCase() === tagId.toLowerCase())) {
			setFilterState(
				{
					...filterState,
					filters: {
						...DEFAULT_FILTER_STATE,
						collectionLabel: [tagId],
					},
					page: 0,
				},
				urlUpdateType
			);
		}
	};

	const deleteAllFilters = () => {
		const copiedFilterState = cloneDeep(filterState);

		// Only remove filters that are user-editable
		for (const key in copiedFilterState) {
			if (Object.prototype.hasOwnProperty.call(copiedFilterState, key)) {
				if (enabledFilters === undefined || enabledFilters.map(String).includes(key)) {
					delete copiedFilterState[key as keyof typeof copiedFilterState];
				}
			}
		}

		setSearchTerms('');
		setFilterState(copiedFilterState, urlUpdateType);
	};

	const handleBookmarkToggle = async (uuid: string, active: boolean) => {
		try {
			const results = searchResults?.results ?? [];
			const resultItem: Avo.Search.ResultItem | undefined = results.find(
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
				assignment: {},
			};
			set(bookmarkStatusesTemp, `[${type}][${uuid}]`, active);
			setBookmarkStatuses(bookmarkStatusesTemp);
			ToastService.success(
				active
					? tHtml('search/views/search___de-bladwijzer-is-aangemaakt')
					: tHtml('search/views/search___de-bladwijzer-is-verwijderd')
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
					? tHtml('search/views/search___het-aanmaken-van-de-bladwijzer-is-mislukt')
					: tHtml('search/views/search___het-verwijderen-van-de-bladwijzer-is-mislukt')
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
			urlUpdateType
		);
	};
	useKeyPress('Enter', copySearchTermsToFormState);

	const renderSearchResults = () => {
		if (searchResultsLoading) {
			return (
				<Spacer margin="top-extra-large">
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				</Spacer>
			);
		}
		if (searchResultsError) {
			return (
				<ErrorView
					message={tHtml('search/views/search___fout-tijdens-ophalen-zoek-resultaten')}
					actionButtons={['home']}
				/>
			);
		}
		return (
			<SearchResults
				currentPage={filterState.page || 0}
				data={searchResults}
				handleBookmarkToggle={handleBookmarkToggle}
				handleTagClicked={
					!enabledFilters || enabledFilters.includes(SearchFilter.keyword)
						? handleTagClicked
						: undefined
				}
				loading={searchResultsLoading}
				pageCount={pageCount}
				setPage={(page: number) =>
					setFilterState({
						...filterState,
						page,
					})
				}
				bookmarkStatuses={bookmarkStatuses}
				qualityLabels={qualityLabels}
				navigateUserRequestForm={navigateToItemRequestForm}
				bookmarkButtons={bookmarks}
				renderDetailLink={renderDetailLink}
				renderSearchLink={renderSearchLink}
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
											placeholder={tText(
												'search/views/search___vul-uw-zoekterm-in'
											)}
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
														: tText(
																'search/views/search___verwijder-alle-filters'
														  )
												}
												ariaLabel={tText(
													'search/views/search___verwijder-alle-filters'
												)}
												icon={isMobileWidth() ? IconName.delete : undefined}
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
							enabledFilters={enabledFilters}
							collectionLabels={qualityLabels}
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
					<ToolbarRight>
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
											enabledOrderProperties.includes(option.value)
									)}
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
