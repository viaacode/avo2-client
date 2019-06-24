import { History, Location } from 'history';
import {
	capitalize,
	cloneDeep,
	compact,
	every,
	find,
	flatten,
	isArray,
	isEmpty,
	isEqual,
	isNil,
	isPlainObject,
	noop,
	pickBy,
	remove,
} from 'lodash-es';
import queryString from 'query-string';
import React, { Component, Fragment, ReactNode } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';
import { setDeepState, setState, unsetDeepState } from '../../helpers/setState';
import { doSearch } from '../../redux/search/searchActions';
import {
	DateRange,
	// FilterOptionSearch,
	Filters,
	OptionProp,
	SearchOrderDirection,
	SearchOrderProperty,
	SearchResponse,
	SearchResultItem,
} from '../../types/searchTypes';

import {
	Button,
	Container,
	Form,
	FormGroup,
	Navbar,
	Pagination,
	Select,
	TagList,
	TextInput,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
	ToolbarTitle,
} from '../../components/avo2-components/src';

import { SearchResult } from '../../components/avo2-components/src/components/SearchResult/SearchResult';
import {
	CheckboxDropdown,
	CheckboxOption,
} from '../../components/CheckboxDropdown/CheckboxDropdown';
import { CheckboxModal } from '../../components/CheckboxModal/CheckboxModal';
import { DateRangeDropdown } from '../../components/DateRangeDropdown/DateRangeDropdown';
import { formatDate, formatDuration } from '../../helpers/formatting';
import { generateSearchLinkString } from '../../helpers/generateLink';
import { LANGUAGES } from '../../helpers/languages';

type SearchProps = {};

const ITEMS_PER_PAGE = 10;

interface SearchState extends StaticContext {
	formState: Filters;
	// filterOptionSearch: FilterOptionSearch;
	orderProperty: SearchOrderProperty;
	orderDirection: SearchOrderDirection;
	multiOptions: { [key: string]: OptionProp[] };
	results: {
		items: SearchResultItem[];
		count: number;
	};
	currentPage: number;
}

interface TagInfo {
	label: string;
	prop: keyof Filters;
	value: any;
}

const DEFAULT_FORM_STATE = {
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

export class Search extends Component<RouteComponentProps<SearchProps>, SearchState> {
	history: History;
	location: Location;

	constructor(props: RouteComponentProps) {
		super(props);
		this.history = props.history;
		this.location = props.location;
		this.state = {
			formState: DEFAULT_FORM_STATE,
			// filterOptionSearch: {
			// 	type: '',
			// 	educationLevel: '',
			// 	domain: '',
			// 	language: '',
			// 	keyword: '',
			// 	subject: '',
			// 	serie: '',
			// 	provider: '',
			// },
			orderProperty: 'relevance',
			orderDirection: 'desc',
			multiOptions: {},
			results: {
				items: [],
				count: 0,
			},
			currentPage: 0,
		};
	}

	componentDidMount() {
		this.getFiltersFromQueryParams(true)
			.then(noop)
			.catch(err => {
				// TODO show error toast
				console.error(err);
			});
	}

	async getFiltersFromQueryParams(initialSearch: boolean = false): Promise<void> {
		// Check if current url already has a query param set
		const queryParams = queryString.parse(this.location.search);
		try {
			const newState: SearchState = cloneDeep(this.state);
			if (
				queryParams.filters ||
				queryParams.orderProperty ||
				queryParams.orderDirection ||
				queryParams.page
			) {
				// Extract info from filter query params
				if (queryParams.filters) {
					newState.formState = JSON.parse(queryParams.filters as string);
				}
				newState.orderProperty = (queryParams.orderProperty || 'relevance') as SearchOrderProperty;
				newState.orderDirection = (queryParams.orderDirection || 'desc') as SearchOrderDirection;
				newState.currentPage = parseInt((queryParams.page as string) || '1', 10) - 1;
			} else {
				// No filter query params present => reset state
				newState.formState = DEFAULT_FORM_STATE;
				newState.orderProperty = 'relevance';
				newState.orderDirection = 'desc';
				newState.currentPage = 0;
			}

			if (!isEqual(newState, this.state)) {
				// Only rerender if query params actually changed
				await setState(this, newState);
				await this.submitSearchForm();
			} else if (initialSearch) {
				await this.submitSearchForm();
			}
		} catch (err) {
			// TODO show toast error: Ongeldige zoek query
			console.error(err);
		}
	}

	private setFiltersInQueryParams(): void {
		const filterOptions: Partial<Filters> = this.cleanupFilterObject(
			cloneDeep(this.state.formState)
		);

		// Remember this search by adding it to the query params in the url
		const filters = isEmpty(filterOptions) ? null : `filters=${JSON.stringify(filterOptions)}`;
		const orderProperty =
			this.state.orderProperty === 'relevance' ? null : `orderProperty=${this.state.orderProperty}`;
		const orderDirection =
			this.state.orderDirection === 'desc' ? null : `orderDirection=${this.state.orderDirection}`;
		const page = this.state.currentPage === 0 ? null : `page=${this.state.currentPage + 1}`;

		const queryParams: string = compact([filters, orderProperty, orderDirection, page]).join('&');
		this.history.push({
			pathname: '/search',
			search: queryParams.length ? `?${queryParams}` : '',
		});
	}

	// handleFilterOptionSearchChange = (event: ChangeEvent) => {
	// 	const target = event.target as HTMLInputElement;
	// 	if (target) {
	// 		const { name, value } = target;
	// 		setDeepState(this, `filterOptionSearch.${name}`, value).then(noop);
	// 	}
	// };

	handleFilterFieldChange = async (value: string | string[] | DateRange | null, id: string) => {
		if (value) {
			await setDeepState(this, `formState.${id}`, value);
		} else {
			await unsetDeepState(this, `formState.${id}`);
		}
	};

	handleOrderChanged = async (value: string = 'relevance_desc') => {
		const valueParts: string[] = value.split('_');
		const orderProperty: SearchOrderProperty = valueParts[0] as SearchOrderProperty;
		const orderDirection: SearchOrderDirection = valueParts[1] as SearchOrderDirection;
		await setState(this, {
			orderProperty: orderProperty as SearchOrderProperty,
			orderDirection: orderDirection as SearchOrderDirection,
		});
		await this.submitSearchForm();
	};

	private cleanupFilterObject(obj: any): any {
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
	}

	async executeSearch(): Promise<SearchResponse> {
		// Parse values from formState into a parsed object that we'll send to the proxy search endpoint
		const filterOptions: Partial<Filters> = this.cleanupFilterObject(
			cloneDeep(this.state.formState)
		);

		// // Parse values from formState into a parsed object that we'll send to the proxy search endpoint
		// const filterOptionSearch: Partial<FilterOptionSearch> = this.cleanupFilterObject(
		// 	cloneDeep(this.state.filterOptionSearch)
		// );

		// TODO do the search by dispatching a redux action
		return await doSearch(
			filterOptions,
			{},
			this.state.orderProperty,
			this.state.orderDirection,
			this.state.currentPage * ITEMS_PER_PAGE,
			ITEMS_PER_PAGE
		);
	}

	// private getFilterOptions(searchTerm: string, propertyName: string): Promise<OptionProp[]> {
	// 	const searchResponse: SearchResponse = await this.executeSearch();
	// 	return searchResponse.aggregations[propertyName];
	// }

	submitSearchForm = async () => {
		try {
			const searchResponse: SearchResponse = await this.executeSearch();

			this.setState({
				...this.state,
				multiOptions: searchResponse.aggregations,
				results: {
					items: searchResponse.results,
					count: searchResponse.count,
				},
			});

			this.setFiltersInQueryParams();
			window.scrollTo(0, 0);
		} catch (err) {
			// TODO show error toast
		}
	};

	private renderCheckboxDropdown(
		label: string,
		propertyName: keyof Filters,
		disabled: boolean = false,
		style: any = {}
	): ReactNode {
		const multiOptions = (this.state.multiOptions[propertyName] || []).map(
			(option: OptionProp): CheckboxOption => {
				let label = capitalize(option.option_name);
				if (propertyName === 'language') {
					label = this.languageCodeToLabel(option.option_name);
				}
				return {
					label: `${label} (${option.option_count})`,
					id: option.option_name,
					checked: false,
				};
			}
		);

		return (
			<li style={{ display: 'flex', ...style }}>
				<CheckboxDropdown
					label={label}
					id={propertyName}
					options={multiOptions} // TODO reset state of CheckboxModal when closed, but not applied. confirmed by leen
					disabled={disabled}
					onChange={async (values: string[]) => {
						await this.handleFilterFieldChange(values, propertyName);
						await this.submitSearchForm();
					}}
				/>
			</li>
		);
	}

	private languageCodeToLabel(code: string): string {
		return capitalize(LANGUAGES.nl[code]) || code;
	}

	private renderCheckboxModal(label: string, propertyName: string) {
		const multiOptions = (this.state.multiOptions[propertyName] || []).map(
			(option: OptionProp): CheckboxOption => {
				const label = capitalize(option.option_name);
				return {
					label: `${label} (${option.option_count})`,
					id: option.option_name,
					checked: false,
				};
			}
		);

		return (
			<li style={{ display: 'flex' }}>
				<CheckboxModal
					label={label}
					id={propertyName}
					initialOptions={multiOptions} // TODO reset state of CheckboxModal when closed, but not applied. confirmed by leen
					onChange={async (values: string[]) => {
						await this.handleFilterFieldChange(values, propertyName);
						await this.submitSearchForm();
					}}
				/>
			</li>
		);
	}

	private renderDateRangeDropdown(label: string, propertyName: keyof Filters): ReactNode {
		return (
			<li style={{ display: 'flex' }}>
				<DateRangeDropdown
					label={label}
					id={propertyName}
					onChange={async (range: DateRange) => {
						await this.handleFilterFieldChange(range, propertyName); // TODO reset state of CheckboxModal when closed, but not applied. confirmed by leen
						await this.submitSearchForm();
					}}
				/>
			</li>
		);
	}

	renderFilterControls() {
		return (
			<div className="c-filter-dropdown-list">
				{this.renderCheckboxDropdown('Type', 'type')}
				{this.renderCheckboxDropdown('Onderwijsniveau', 'educationLevel')}
				{this.renderCheckboxDropdown('Domein', 'domain', true)}
				{this.renderCheckboxModal('Vak', 'subject')}
				{this.renderCheckboxModal('Onderwerp', 'keyword')}
				{this.renderCheckboxModal('Serie', 'serie')}
				{this.renderDateRangeDropdown('Uitzenddatum', 'broadcastDate')}
				{this.renderCheckboxDropdown('Taal', 'language')}
				{this.renderCheckboxDropdown('Aanbieder', 'provider', false, { marginRight: 0 })}
			</div>
		);
	}

	private getTagInfos(filterProp: keyof Filters, filterValue: any): TagInfo[] {
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
					label = this.languageCodeToLabel(filterVal);
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
	}

	renderSelectedFilters() {
		const tagInfos: TagInfo[] = flatten(
			(Object.keys(this.state.formState) as (keyof Filters)[]).map((filterProp: keyof Filters) =>
				this.getTagInfos(filterProp, this.state.formState[filterProp])
			)
		);
		return (
			<div className="u-spacer-bottom-l">
				<TagList
					closable={true}
					swatches={false}
					onTagClosed={async (tagLabel: string) => {
						const tagInfo = find(tagInfos, (tagInfo: TagInfo) => tagInfo.label === tagLabel);
						if (tagInfo) {
							await this.deleteFilter(tagInfo);
						}
					}}
					tags={tagInfos.map((tagInfo: TagInfo) => tagInfo.label)}
				/>
			</div>
		);
	}

	async deleteFilter(tagInfo: TagInfo) {
		if (isPlainObject(tagInfo.value) && (tagInfo.value.gte || tagInfo.value.lte)) {
			await unsetDeepState(this, `formState.${tagInfo.prop}`);
			return;
		}
		if (isArray(this.state.formState[tagInfo.prop])) {
			const filterArray: string[] = this.state.formState[tagInfo.prop] as string[];
			remove(filterArray, filterItem => filterItem === tagInfo.value);
			await setDeepState(this, `formState.${tagInfo.prop}`, filterArray);
			await this.submitSearchForm();
		} else {
			console.error('Failed to remove selected filter: ', tagInfo.prop, tagInfo.value);
		}
	}

	private renderSearchResult = (result: SearchResultItem) => {
		const metaData = [];
		let thumbnailMeta = '';
		if (result.administrative_type === 'audio' || result.administrative_type === 'video') {
			// TODO investigate why all durations return 0
			if (result.duration_seconds) {
				thumbnailMeta = formatDuration(result.duration_seconds || 0);
				metaData.push({
					label: thumbnailMeta,
				});
			}
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
				key={result.id}
				pid={result.id}
				type={result.administrative_type}
				title={result.dc_title}
				link={contentLink}
				originalCp={result.original_cp}
				originalCpLink={generateSearchLinkString('provider', result.original_cp)}
				date={result.dcterms_issued}
				thumbnailPath={result.thumbnail_path}
				tags={['Redactiekeuze', 'Partner']}
				numberOfItems={25}
				duration={result.duration_seconds || 0}
				description={result.dcterms_abstract}
				onToggleBookmark={this.handleBookmarkToggle}
				onOriginalCpLinkClicked={this.handleOriginalCpLinkClicked}
			/>
		);
	};

	private renderSearchResults() {
		return (
			<ul className="c-search-result-list">
				{this.state.results.items.map(this.renderSearchResult)}
			</ul>
		);
	}

	private setPage = async (pageIndex: number): Promise<void> => {
		await setDeepState(this, 'currentPage', pageIndex);
		this.setFiltersInQueryParams();
		await this.submitSearchForm();
	};

	private handleBookmarkToggle(id: string, active: boolean) {
		console.log('TODO handle search result bookmark button toggle', active, id);
	}

	private handleOriginalCpLinkClicked = async (id: string, originalCp: string | undefined) => {
		if (originalCp) {
			await setDeepState(this, 'formState', {
				...DEFAULT_FORM_STATE,
				provider: [originalCp],
			});
			this.setFiltersInQueryParams();
			await this.submitSearchForm();
		}
	};

	render() {
		const orderOptions = [
			{ label: 'Meest relevant', value: 'relevance_desc' },
			{ label: 'Meest bekeken', value: 'views_desc', disabled: true },
			{ label: 'Uitzenddatum aflopend', value: 'broadcastDate_desc' },
			{ label: 'Uitzenddatum oplopend', value: 'broadcastDate_asc' },
			{ label: 'Laatst toegevoegd', value: 'addedDate_desc', disabled: true },
			{ label: 'Laatst gewijzigd', value: 'editDate_desc', disabled: true },
		];
		const defaultOrder = `${this.state.orderProperty || 'relevance'}_${this.state.orderDirection ||
			'desc'}`;
		const resultsCount = this.state.results.count;
		// elasticsearch can only handle 10000 results efficiently
		const pageCount = Math.ceil(Math.min(resultsCount, 10000) / ITEMS_PER_PAGE);
		const resultStart = this.state.currentPage * ITEMS_PER_PAGE + 1;
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
											onChange={value => this.handleOrderChanged(value)}
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
												defaultValue={this.state.formState.query}
												icon="search"
												onChange={(searchTerm: string) =>
													this.handleFilterFieldChange(searchTerm, 'query')
												}
											/>
										</FormGroup>
										<FormGroup inlineMode="shrink">
											<Button label="Zoeken" type="primary" onClick={this.submitSearchForm} />
										</FormGroup>
									</Form>
								</div>
							</div>
							{this.renderSelectedFilters()}
							{this.renderFilterControls()}
						</div>
					</Container>
				</Navbar>
				<Container mode="vertical">
					<Container mode="horizontal">
						{this.renderSearchResults()}
						<div className="u-spacer-l">
							<Pagination
								pageCount={pageCount}
								currentPage={this.state.currentPage}
								onPageChange={this.setPage}
							/>
						</div>
					</Container>
				</Container>
			</Container>
		);
	}
}
