import {
	Blankslate,
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Form,
	FormGroup,
	Navbar,
	Pagination,
	SearchResult,
	SearchResultSubtitle,
	SearchResultThumbnail,
	SearchResultTitle,
	Select,
	Spacer,
	Spinner,
	TextInput,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	ToolbarTitle,
	useKeyPress,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import {
	capitalize,
	cloneDeep,
	compact,
	every,
	get,
	isArray,
	isEmpty,
	isEqual,
	isNil,
	isPlainObject,
	pickBy,
} from 'lodash-es';
import queryString from 'query-string';
import React, { Fragment, FunctionComponent, ReactNode, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';

import { getSearchResults } from '../store/actions';
import { selectSearchLoading, selectSearchResults } from '../store/selectors';

import { copyToClipboard } from '../../helpers/clipboard';
import { CheckboxDropdown } from '../../shared/components/CheckboxDropdown/CheckboxDropdown';
import { CheckboxModal, CheckboxOption } from '../../shared/components/CheckboxModal/CheckboxModal';
import { DateRangeDropdown } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import { formatDate } from '../../shared/helpers/formatters/date';
import { formatDuration } from '../../shared/helpers/formatters/duration';
import { generateSearchLink } from '../../shared/helpers/generateLink';
import { LANGUAGES } from '../../shared/helpers/languages';

interface SearchProps extends RouteComponentProps {
	searchResults: Avo.Search.Response | null;
	searchResultsLoading: boolean;
	search: (
		orderProperty: Avo.Search.OrderProperty,
		orderDirection: Avo.Search.OrderDirection,
		from: number,
		size: number,
		filters?: Partial<Avo.Search.Filters>,
		filterOptionSearch?: Partial<Avo.Search.FilterOption>
	) => Dispatch;
}

const ITEMS_PER_PAGE = 10;

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
	prop: Avo.Search.FilterProp;
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

const Search: FunctionComponent<SearchProps> = ({
	searchResults,
	searchResultsLoading,
	search,
	history,
	location,
}: SearchProps) => {
	const [formState, setFormState] = useState(DEFAULT_FORM_STATE);
	const [sortOrder, setSortOrder]: [SortOrder, (sortOrder: SortOrder) => void] = useState(
		DEFAULT_SORT_ORDER
	);
	const [multiOptions, setMultiOptions] = useState({} as {
		[key: string]: Avo.Search.OptionProp[];
	});
	const [currentPage, setCurrentPage] = useState(0);
	const [searchTerms, setSearchTerms] = useState('');
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);

	/**
	 * Update the search results when the formState, sortOrder or the currentPage changes
	 */
	useEffect(() => {
		// Parse values from formState into a parsed object that we'll send to the proxy search endpoint
		const filterOptions: Partial<Avo.Search.Filters> = cleanupFilterObject(cloneDeep(formState));

		// TODO do the search by dispatching a redux action
		search(
			sortOrder.orderProperty,
			sortOrder.orderDirection,
			currentPage * ITEMS_PER_PAGE,
			ITEMS_PER_PAGE,
			filterOptions,
			{}
		);
	}, [formState, sortOrder, currentPage, history]);

	useEffect(() => {
		if (searchResults) {
			const filterOptions: Partial<Avo.Search.Filters> = cleanupFilterObject(cloneDeep(formState));

			// Update the checkbox items and counts
			setMultiOptions(searchResults.aggregations);

			// Remember this search by adding it to the query params in the url
			const filters = isEmpty(filterOptions) ? null : `filters=${JSON.stringify(filterOptions)}`;
			const orderProperty =
				sortOrder.orderProperty === 'relevance' ? null : `orderProperty=${sortOrder.orderProperty}`;
			const orderDirection =
				sortOrder.orderDirection === 'desc' ? null : `orderDirection=${sortOrder.orderDirection}`;
			const page = currentPage === 0 ? null : `page=${currentPage + 1}`;

			const queryParams: string = compact([filters, orderProperty, orderDirection, page]).join('&');
			history.push({
				pathname: '/search',
				search: queryParams.length ? `?${queryParams}` : '',
			});

			//  Scroll to the first search result
			window.scrollTo(0, 0);
		}
	}, [searchResults]);

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
		id: Avo.Search.FilterProp
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
		propertyName: Avo.Search.FilterProp,
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
					id={propertyName as string}
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

	const renderCheckboxModal = (label: string, propertyName: Avo.Search.FilterProp) => {
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
		propertyName: Avo.Search.FilterProp
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
				{renderCheckboxModal('Trefwoord', 'keyword')}
				{renderCheckboxModal('Serie', 'serie')}
				{renderDateRangeDropdown('Uitzenddatum', 'broadcastDate')}
				{renderCheckboxDropdown('Taal', 'language')}
				{renderCheckboxDropdown('Aanbieder', 'provider', false, { marginRight: 0 })}
			</div>
		);
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
		const contentLink = `/item/${result.id}`;

		return (
			<SearchResult
				key={`search-result-${result.id}`}
				type={result.administrative_type}
				date={formatDate(result.dcterms_issued)}
				tags={[
					{ label: 'Redactiekeuze', id: 'redactiekeuze' },
					{ label: 'Partner', id: 'partner' },
				]}
				viewCount={412}
				bookmarkCount={85}
				// duration={formatDuration(result.duration_seconds || 0)}
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
					{!searchResultsLoading && searchResults && searchResults.count !== 0 && (
						<Fragment>
							<ul className="c-search-result-list">
								{searchResults.results.map(renderSearchResult)}
							</ul>
							<Spacer margin="large">
								<Pagination
									pageCount={pageCount}
									currentPage={currentPage}
									onPageChange={setPage}
								/>
							</Spacer>
						</Fragment>
					)}
					{!searchResultsLoading && searchResults && searchResults.count === 0 && (
						<Blankslate
							body=""
							icon="search"
							title="Er zijn geen zoekresultaten die voldoen aan uw filters."
						/>
					)}
					{searchResultsLoading && (
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

	const copySearchLink = () => {
		copyToClipboard(window.location.href);
	};

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
	const resultsCount = get(searchResults, 'count', 0);
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
							<div className="o-flex o-flex--spaced">
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
								<Dropdown
									isOpen={isOptionsMenuOpen}
									onOpen={() => setIsOptionsMenuOpen(true)}
									onClose={() => setIsOptionsMenuOpen(false)}
									autoSize={true}
									placement="bottom-end"
								>
									<DropdownButton>
										<Button type="tertiary" icon="more-horizontal" />
									</DropdownButton>
									<DropdownContent>
										<Fragment>
											<a
												className="c-menu__item"
												onClick={() => {
													copySearchLink();
													setIsOptionsMenuOpen(false);
													// TODO show toast with "successfully copied" message
												}}
											>
												<div className="c-menu__label">
													Kopieer vaste link naar deze zoekopdracht
												</div>
											</a>
											<a
												className="c-menu__item"
												onClick={() => {
													setIsOptionsMenuOpen(false);
													// TODO show toast with "not yet implemented" message
												}}
											>
												{/* TODO Create link to create search assignment task */}
												<div className="c-menu__label">Maak van deze zoekopdracht een opdracht</div>
											</a>
										</Fragment>
									</DropdownContent>
								</Dropdown>
							</div>
						</ToolbarRight>
					</Toolbar>
				</Container>
			</Navbar>
			<Navbar autoHeight={true}>
				<Container mode="horizontal">
					<Spacer margin="top-large">
						<Spacer margin="bottom-large">
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
						</Spacer>
						{renderFilterControls()}
					</Spacer>
				</Container>
			</Navbar>
			{renderSearchResults()}
		</Container>
	);
};

const mapStateToProps = (state: any) => ({
	searchResults: selectSearchResults(state),
	searchResultsLoading: selectSearchLoading(state),
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
			dispatch(getSearchResults(
				orderProperty,
				orderDirection,
				from,
				size,
				filters,
				filterOptionSearch
			) as any),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Search);
