import React, { Fragment, FunctionComponent, ReactNode, useEffect, useState } from 'react';

import { Avo } from '@viaa/avo2-types';
import {
	capitalize,
	cloneDeep,
	compact,
	every,
	find,
	flatten,
	get,
	isArray,
	isEmpty,
	isEqual,
	isNil,
	isPlainObject,
	pickBy,
	remove,
} from 'lodash-es';
import queryString from 'query-string';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { doSearch } from '../../redux/search/searchActions';

import {
	Blankslate,
	Button,
	Container,
	Form,
	FormGroup,
	Navbar,
	Pagination,
	SearchResult,
	SearchResultSubtitle,
	SearchResultThumbnail,
	SearchResultTitle,
	Select,
	Spinner,
	TagList,
	TextInput,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	ToolbarTitle,
	useKeyPress,
} from '../../components/avo2-components/src';
import { CheckboxDropdown } from '../../components/CheckboxDropdown/CheckboxDropdown';
import { CheckboxModal, CheckboxOption } from '../../components/CheckboxModal/CheckboxModal';
import { DateRangeDropdown } from '../../components/DateRangeDropdown/DateRangeDropdown';
import { formatDate, formatDuration } from '../../helpers/formatting';
import { generateSearchLink } from '../../helpers/generateLink';
import { LANGUAGES } from '../../helpers/languages';

interface SearchProps extends RouteComponentProps {}

const ITEMS_PER_PAGE = 10;

// interface SearchState extends StaticContext {
// 	formState: Avo.Search.Filters;
// 	// filterOptionSearch: FilterOptionSearch;
// 	orderProperty: Avo.Search.OrderProperty;
// 	orderDirection: Avo.Search.OrderDirection;
// 	multiOptions: { [key: string]: Avo.Search.OptionProp[] };
// 	results: {
// 		items: Avo.Search.ResultItem[];
// 		count: number;
// 	};
// 	currentPage: number;
// }

interface SortOrder {
	orderProperty: Avo.Search.OrderProperty;
	orderDirection: Avo.Search.OrderDirection;
}

interface SearchResults {
	count: number;
	items: Avo.Search.ResultItem[];
}

interface TagInfo {
	label: string;
	prop: keyof Avo.Search.Filters;
	value: any;
}

const DEFAULT_FORM_STATE: Avo.Search.Filters = {
	query: '',
	type: [],
	educationLevel: [],
	domain: [],
	broadcastDate: {
		gte: '',
		lte: '',
	},
	language: [],
	keyword: [],
	subject: [],
	serie: [],
	provider: [],
};

const DEFAULT_SORT_ORDER: SortOrder = {
	orderProperty: 'relevance',
	orderDirection: 'desc',
} as SortOrder;

export const Search: FunctionComponent<SearchProps> = ({ history, location }: SearchProps) => {
	const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
	const [sortOrder, setSortOrder]: [SortOrder, (sortOrder: SortOrder) => void] = useState(
		DEFAULT_SORT_ORDER
	);
	const [multiOptions, setMultiOptions] = useState({} as {
		[key: string]: Avo.Search.OptionProp[];
	});
	const [searchResults, setSearchResults] = useState({ items: [], count: 0 } as SearchResults);
	const [currentPage, setCurrentPage] = useState(0);
	const [searchTerms, setSearchTerms] = useState('');
	const [loadingSearchResults, setLoadingSearchResults] = useState(true);

	/**
	 * Update the search results when the formState, sortOrder or the currentPage changes
	 */
	useEffect(() => {
		const updateSearchResults = async () => {
			try {
				setLoadingSearchResults(true);
				// Parse values from formState into a parsed object that we'll send to the proxy search endpoint
				const filterOptions: Partial<Avo.Search.Filters> = cleanupFilterObject(
					cloneDeep(formState)
				);

				// // Parse values from formState into a parsed object that we'll send to the proxy search endpoint
				// const filterOptionSearch: Partial<FilterOptionSearch> = cleanupFilterObject(
				// 	cloneDeep(state.filterOptionSearch)
				// );

				// TODO do the search by dispatching a redux action
				const searchResponse: Avo.Search.Response = await doSearch(
					filterOptions,
					{},
					sortOrder.orderProperty,
					sortOrder.orderDirection,
					currentPage * ITEMS_PER_PAGE,
					ITEMS_PER_PAGE
				);

				// Update the checkbox items and counts
				setMultiOptions(searchResponse.aggregations);

				// Set the search results into the state
				setSearchResults({
					items: searchResponse.results,
					count: searchResponse.count,
				});

				// Remember this search by adding it to the query params in the url
				const filters = isEmpty(filterOptions) ? null : `filters=${JSON.stringify(filterOptions)}`;
				const orderProperty =
					sortOrder.orderProperty === 'relevance'
						? null
						: `orderProperty=${sortOrder.orderProperty}`;
				const orderDirection =
					sortOrder.orderDirection === 'desc' ? null : `orderDirection=${sortOrder.orderDirection}`;
				const page = currentPage === 0 ? null : `page=${currentPage + 1}`;

				const queryParams: string = compact([filters, orderProperty, orderDirection, page]).join(
					'&'
				);
				history.push({
					pathname: '/search',
					search: queryParams.length ? `?${queryParams}` : '',
				});

				// Scroll to the first search result
				window.scrollTo(0, 0);
				setLoadingSearchResults(false);
			} catch (err) {
				console.error('Failed to get search results from the server', err);
			}
		};
		updateSearchResults();
	}, [formState, sortOrder, currentPage, history]);

	// TODO add search in checkbox modal components
	// private getFilterOptions(searchTerm: string, propertyName: string): Promise<Avo.Search.OptionProp[]> {
	// 	const searchResponse: Avo.Search.Response = await executeSearch();
	// 	return searchResponse.aggregations[propertyName];
	// }

	const getFiltersFromQueryParams = () => {
		// Check if current url already has a query param set
		const queryParams = queryString.parse(location.search);
		try {
			let newFormState: Avo.Search.Filters = cloneDeep(formState);
			let newSortOrder: SortOrder = cloneDeep(sortOrder);
			let newCurrentPage: number = currentPage;
			if (
				queryParams.filters ||
				queryParams.orderProperty ||
				queryParams.orderDirection ||
				queryParams.page
			) {
				// Extract info from filter query params
				if (queryParams.filters) {
					newFormState = JSON.parse(queryParams.filters as string);
				}
				newSortOrder.orderProperty = (queryParams.orderProperty ||
					'relevance') as Avo.Search.OrderProperty;
				newSortOrder.orderDirection = (queryParams.orderDirection ||
					'desc') as Avo.Search.OrderDirection;
				newCurrentPage = parseInt((queryParams.page as string) || '1', 10) - 1;
			} else {
				// No filter query params present => reset state
				newFormState = DEFAULT_FORM_STATE;
				newSortOrder = DEFAULT_SORT_ORDER;
				newCurrentPage = 0;
			}

			if (
				!isEqual(newFormState, formState) ||
				!isEqual(newSortOrder, sortOrder) ||
				!isEqual(newCurrentPage, currentPage)
			) {
				// Only rerender if query params actually changed
				setFormState(newFormState);
				setSortOrder(newSortOrder);
				setCurrentPage(newCurrentPage);
			}
		} catch (err) {
			// TODO show toast error: Ongeldige zoek query
			console.error(err);
		}
	};

	// Only execute this effect once after the first render (componentDidMount)
	useEffect(getFiltersFromQueryParams, []);

	// handleFilterOptionSearchChange = (event: ChangeEvent) => {
	// 	const target = event.target as HTMLInputElement;
	// 	if (target) {
	// 		const { name, value } = target;
	// 		setDeepState(this, `filterOptionSearch.${name}`, value).then(noop);
	// 	}
	// };

	const handleFilterFieldChange = async (
		value: string | string[] | Avo.Search.DateRange | null,
		id: keyof Avo.Search.Filters
	) => {
		if (value) {
			setFormState({
				...formState,
				[id]: value,
			});
		} else {
			setFormState({
				...formState,
				[id]: DEFAULT_FORM_STATE[id],
			});
		}
	};

	const handleOrderChanged = async (value: string = 'relevance_desc') => {
		const valueParts: string[] = value.split('_');
		const orderProperty: Avo.Search.OrderProperty = valueParts[0] as Avo.Search.OrderProperty;
		const orderDirection: Avo.Search.OrderDirection = valueParts[1] as Avo.Search.OrderDirection;
		setSortOrder({
			orderProperty: orderProperty as Avo.Search.OrderProperty,
			orderDirection: orderDirection as Avo.Search.OrderDirection,
		});
	};

	const cleanupFilterObject = (obj: any): any => {
		return pickBy(obj, (value: any) => {
			const isEmptyString = value === '';
			const isUndefinedOrNull = isNil(value);
			const isEmptyObjectOrArray = (isPlainObject(value) || isArray(value)) && isEmpty(value);
			const isArrayWithEmptyValues = isArray(value) && every(value, value => value === '');
			const isEmptyRangeObject = isPlainObject(value) && !(value as any).gte && !(value as any).lte;

			return (
				!isEmptyString &&
				!isUndefinedOrNull &&
				!isEmptyObjectOrArray &&
				!isArrayWithEmptyValues &&
				!isEmptyRangeObject
			);
		});
	};

	const renderCheckboxDropdown = (
		label: string,
		propertyName: keyof Avo.Search.Filters,
		disabled: boolean = false,
		style: any = {}
	): ReactNode => {
		const checkboxMultiOptions = (multiOptions[propertyName] || []).map(
			(option: Avo.Search.OptionProp): CheckboxOption => {
				let label = capitalize(option.option_name);
				if (propertyName === 'language') {
					label = languageCodeToLabel(option.option_name);
				}
				return {
					label: `${label} (${option.option_count})`,
					id: option.option_name,
					checked: ((formState[propertyName] as string[]) || []).includes(option.option_name),
				};
			}
		);

		return (
			<li style={{ display: 'flex', ...style }}>
				<CheckboxDropdown
					label={label}
					id={propertyName}
					options={checkboxMultiOptions}
					disabled={disabled}
					onChange={async (values: string[]) => {
						await handleFilterFieldChange(values, propertyName);
					}}
				/>
			</li>
		);
	};

	const languageCodeToLabel = (code: string): string => {
		return capitalize(LANGUAGES.nl[code]) || code;
	};

	const renderCheckboxModal = (label: string, propertyName: keyof Avo.Search.Filters) => {
		const checkboxMultiOptions = (multiOptions[propertyName] || []).map(
			(option: Avo.Search.OptionProp): CheckboxOption => {
				const label = capitalize(option.option_name);
				return {
					label: `${label} (${option.option_count})`,
					id: option.option_name,
					checked: ((formState[propertyName] as string[]) || []).includes(option.option_name),
				};
			}
		);

		return (
			<li style={{ display: 'flex' }}>
				<CheckboxModal
					label={label}
					id={propertyName}
					options={checkboxMultiOptions}
					onChange={async (values: string[]) => {
						await handleFilterFieldChange(values, propertyName);
					}}
				/>
			</li>
		);
	};

	const renderDateRangeDropdown = (
		label: string,
		propertyName: keyof Avo.Search.Filters
	): ReactNode => {
		const range: Avo.Search.DateRange = get(formState, 'broadcastDate') || { gte: '', lte: '' };
		range.gte = range.gte || '';
		range.lte = range.lte || '';

		return (
			<li style={{ display: 'flex' }}>
				<DateRangeDropdown
					label={label}
					id={propertyName}
					range={range as { gte: string; lte: string }}
					onChange={async (range: Avo.Search.DateRange) => {
						await handleFilterFieldChange(range, propertyName);
					}}
				/>
			</li>
		);
	};

	const renderFilterControls = () => {
		return (
			<div className="c-filter-dropdown-list">
				{renderCheckboxDropdown('Type', 'type')}
				{renderCheckboxDropdown('Onderwijsniveau', 'educationLevel')}
				{renderCheckboxDropdown('Domein', 'domain', true)}
				{renderCheckboxModal('Vak', 'subject')}
				{renderCheckboxModal('Onderwerp', 'keyword')}
				{renderCheckboxModal('Serie', 'serie')}
				{renderDateRangeDropdown('Uitzenddatum', 'broadcastDate')}
				{renderCheckboxDropdown('Taal', 'language')}
				{renderCheckboxDropdown('Aanbieder', 'provider', false, { marginRight: 0 })}
			</div>
		);
	};

	const getTagInfos = (filterProp: keyof Avo.Search.Filters, filterValue: any): TagInfo[] => {
		// Do not render query filter or empty filters
		if (
			filterProp === 'query' ||
			filterValue === '' ||
			filterValue === [] ||
			(isArray(filterValue) && every(filterValue, filter => !filter)) // Array of empty strings
		) {
			return [];
		}

		// Render date range option filters
		if (isPlainObject(filterValue)) {
			if (filterValue.gte && filterValue.lte) {
				return [
					{
						label: `${formatDate(filterValue.gte)} - ${formatDate(filterValue.lte)}`,
						prop: filterProp,
						value: filterValue,
					},
				];
			}
			if (filterValue.gte) {
				return [
					{
						label: `na ${formatDate(filterValue.gte)}`,
						prop: filterProp,
						value: filterValue,
					},
				];
			}
			if (filterValue.lte) {
				return [
					{
						label: `voor ${formatDate(filterValue.lte)}`,
						prop: filterProp,
						value: filterValue,
					},
				];
			}
			return []; // Do not render a filter if date object is empty: {gte: "", lte: ""}
		}

		// Render multi option filters
		if (isArray(filterValue)) {
			return filterValue.map((filterVal: string) => {
				let label = filterVal;
				if (filterProp === 'language') {
					label = languageCodeToLabel(filterVal);
				}
				return {
					label,
					prop: filterProp,
					value: filterVal,
				};
			});
		}

		console.error('Failed to render selected filter: ', filterProp, filterValue);
		return [];
	};

	const renderSelectedFilters = () => {
		const tagInfos: TagInfo[] = flatten(
			(Object.keys(formState) as (keyof Avo.Search.Filters)[]).map(
				(filterProp: keyof Avo.Search.Filters) => getTagInfos(filterProp, formState[filterProp])
			)
		);
		const tagLabels = tagInfos.map((tagInfo: TagInfo) => tagInfo.label);
		if (tagLabels.length > 1) {
			tagLabels.push('Alle filters wissen');
		}
		return (
			<div className="u-spacer-bottom-l">
				<TagList
					closable={true}
					swatches={false}
					onTagClosed={async (tagLabel: string) => {
						if (tagLabel === 'Alle filters wissen') {
							deleteAllFilters();
						} else {
							const tagInfo = find(tagInfos, (tagInfo: TagInfo) => tagInfo.label === tagLabel);
							if (tagInfo) {
								await deleteFilter(tagInfo);
							}
						}
					}}
					tags={tagLabels}
				/>
			</div>
		);
	};

	const deleteFilter = async (tagInfo: TagInfo) => {
		if (isPlainObject(tagInfo.value) && (tagInfo.value.gte || tagInfo.value.lte)) {
			setFormState({
				...formState,
				[tagInfo.prop]: DEFAULT_FORM_STATE[tagInfo.prop],
			});
			return;
		}
		if (isArray(formState[tagInfo.prop])) {
			const filterArray: string[] = formState[tagInfo.prop] as string[];
			remove(filterArray, filterItem => filterItem === tagInfo.value);
			setFormState({
				...formState,
				[tagInfo.prop]: filterArray,
			});
		} else {
			console.error('Failed to remove selected filter: ', tagInfo.prop, tagInfo.value);
		}
	};

	const deleteAllFilters = () => {
		setFormState({
			...DEFAULT_FORM_STATE,
		});
	};

	const renderSearchResult = (result: Avo.Search.ResultItem) => {
		const metaData = [];
		let thumbnailMeta = '';
		if (result.administrative_type === 'audio' || result.administrative_type === 'video') {
			thumbnailMeta = formatDuration(result.duration_seconds || 0);
			metaData.push({
				label: thumbnailMeta,
			});
		} else {
			// TODO get number of items from result item after bart updates the elasticsearch index
			thumbnailMeta = `${25} items`;
			metaData.push({
				label: thumbnailMeta,
			});
		}
		const contentLink = `/detail/${result.id}`;

		return (
			<SearchResult
				key={`search-result-${result.id}`}
				type={result.administrative_type}
				date={formatDate(result.dcterms_issued)}
				tags={['Redactiekeuze', 'Partner']}
				numberOfItems={25}
				duration={formatDuration(result.duration_seconds || 0)}
				description={result.dcterms_abstract}
				onToggleBookmark={(active: boolean) => handleBookmarkToggle(result.id, active)}
			>
				<SearchResultTitle>
					<Link to={contentLink}>{result.dc_title}</Link>
				</SearchResultTitle>
				<SearchResultSubtitle>
					{generateSearchLink('provider', result.original_cp, 'c-body-2', () =>
						handleOriginalCpLinkClicked(result.id, result.original_cp)
					)}
				</SearchResultSubtitle>
				<SearchResultThumbnail>
					<Link to={contentLink}>
						<Thumbnail
							category={result.administrative_type as any}
							src={result.thumbnail_path}
							label={result.administrative_type}
						/>
					</Link>
				</SearchResultThumbnail>
			</SearchResult>
		);
	};

	const renderSearchResults = () => {
		return (
			<Container mode="vertical">
				<Container mode="horizontal">
					{!loadingSearchResults && searchResults.count !== 0 && (
						<Fragment>
							<ul className="c-search-result-list">
								{searchResults.items.map(renderSearchResult)}
							</ul>
							<div className="u-spacer-l">
								<Pagination
									pageCount={pageCount}
									currentPage={currentPage}
									onPageChange={setPage}
								/>
							</div>
						</Fragment>
					)}
					{!loadingSearchResults && searchResults.count === 0 && (
						<Blankslate
							body=""
							icon="search"
							title="Er zijn geen zoekresultaten die voldoen aan uw filters."
						/>
					)}
					{loadingSearchResults && (
						<div className="o-flex o-flex--horizontal-center">
							<Spinner size="large" />
						</div>
					)}
				</Container>
			</Container>
		);
	};

	const setPage = async (pageIndex: number): Promise<void> => {
		setCurrentPage(pageIndex);
	};

	const handleBookmarkToggle = (id: string, active: boolean) => {
		console.log('TODO handle search result bookmark button toggle', active, id);
	};

	const handleOriginalCpLinkClicked = async (id: string, originalCp: string | undefined) => {
		if (originalCp) {
			setFormState({
				...DEFAULT_FORM_STATE,
				provider: [originalCp],
			});
		}
	};

	/**
	 * Only copy search terms when the user clicks the search button or when enter is pressed
	 * Otherwise we would trigger a search for every letter that is typed
	 */
	const copySearchTermsToFormState = async () => {
		setFormState({
			...formState,
			query: searchTerms,
		});
	};
	useKeyPress('Enter', copySearchTermsToFormState);

	const orderOptions = [
		{ label: 'Meest relevant', value: 'relevance_desc' },
		{ label: 'Meest bekeken', value: 'views_desc', disabled: true },
		{ label: 'Uitzenddatum aflopend', value: 'broadcastDate_desc' },
		{ label: 'Uitzenddatum oplopend', value: 'broadcastDate_asc' },
		{ label: 'Laatst toegevoegd', value: 'addedDate_desc', disabled: true },
		{ label: 'Laatst gewijzigd', value: 'editDate_desc', disabled: true },
	];
	const defaultOrder = `${sortOrder.orderProperty || 'relevance'}_${sortOrder.orderDirection ||
		'desc'}`;
	const resultsCount = searchResults.count;
	// elasticsearch can only handle 10000 results efficiently
	const pageCount = Math.ceil(Math.min(resultsCount, 10000) / ITEMS_PER_PAGE);
	const resultStart = currentPage * ITEMS_PER_PAGE + 1;
	const resultEnd = Math.min(resultStart + ITEMS_PER_PAGE - 1, resultsCount);
	return (
		<Container mode="horizontal">
			<Navbar>
				<Container mode="horizontal">
					<Toolbar>
						<ToolbarLeft>
							<Fragment>
								<ToolbarItem>
									<ToolbarTitle>Zoekresultaten</ToolbarTitle>
								</ToolbarItem>
								<ToolbarItem>
									<p className="c-body-1 u-text-muted">
										{resultStart}-{resultEnd} van {resultsCount} resultaten
									</p>
								</ToolbarItem>
							</Fragment>
						</ToolbarLeft>
						<ToolbarRight>
							<Form type="inline">
								<FormGroup label="Sorteer op" labelFor="sortBy">
									<Select
										id="sortBy"
										options={orderOptions}
										value={defaultOrder}
										onChange={value => handleOrderChanged(value)}
									/>
								</FormGroup>
							</Form>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Navbar>
			<Navbar autoHeight={true}>
				<Container mode="horizontal">
					{/*TODO replace with spacer component when it is built*/}
					<div className="u-spacer-top-l">
						{/*TODO replace with spacer component when it is built*/}
						<div className="u-spacer-bottom-l">
							<div className="u-limit-width-bp3">
								<Form type="inline">
									<FormGroup inlineMode="grow">
										<TextInput
											id="query"
											placeholder="Vul uw zoekterm in..."
											value={formState.query}
											icon="search"
											onChange={setSearchTerms}
										/>
									</FormGroup>
									<FormGroup inlineMode="shrink">
										<Button label="Zoeken" type="primary" onClick={copySearchTermsToFormState} />
									</FormGroup>
								</Form>
							</div>
						</div>
						{renderSelectedFilters()}
						{renderFilterControls()}
					</div>
				</Container>
			</Navbar>
			{renderSearchResults()}
		</Container>
	);
};
