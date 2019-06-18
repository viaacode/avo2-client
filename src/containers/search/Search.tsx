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
	isNil,
	isPlainObject,
	noop,
	pickBy,
	remove,
	reverse,
} from 'lodash-es';
import queryString from 'query-string';
import React, { ChangeEvent, Component, Fragment, ReactNode } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';
import { setDeepState, unsetDeepState } from '../../helpers/setDeepState';
import { doSearch } from '../../redux/search/searchActions';
import {
	DateRange,
	FilterOptionSearch,
	Filters,
	OptionProp,
	SearchOrderDirection,
	SearchOrderProperty,
	SearchResponse,
	SearchResultItem,
} from '../../types';

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

import {
	CheckboxDropdown,
	CheckboxOption,
} from '../../components/CheckboxDropdown/CheckboxDropdown';
import { CheckboxModal } from '../../components/CheckboxModal/CheckboxModal';
import { DateRangeDropdown } from '../../components/DateRangeDropdown/DateRangeDropdown';
import { LANGUAGES } from '../../helpers/languages';

type SearchProps = {};

const ITEMS_PER_PAGE = 10;

interface SearchState extends StaticContext {
	formState: Filters;
	filterOptionSearch: FilterOptionSearch;
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

export class Search extends Component<RouteComponentProps<SearchProps>, SearchState> {
	history: History;
	location: Location;

	constructor(props: RouteComponentProps) {
		super(props);
		this.history = props.history;
		this.location = props.location;
		this.state = {
			// formState: {
			// 	// Default values for filters for easier testing of search api // TODO clear default filters
			// 	query: 'wie verdient er aan uw schulden',
			// 	type: ['video', 'audio'],
			// 	educationLevel: ['Secundair 2de graad', 'Secundair 3de graad'],
			// 	domain: [],
			// 	broadcastDate: {
			// 		gte: '2000-01-01',
			// 		lte: '2020-01-01',
			// 	},
			// 	language: ['nl', 'fr'],
			// 	keyword: ['armoede'],
			// 	subject: ['levensbeschouwing'],
			// 	serie: ['Pano'],
			// 	provider: [],
			// },
			formState: {
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
			},
			filterOptionSearch: {
				type: '',
				educationLevel: '',
				domain: '',
				language: '',
				keyword: '',
				subject: '',
				serie: '',
				provider: '',
			},
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

	async componentDidMount() {
		await this.getFiltersFromQueryParams();

		this.submitSearchForm().then(noop);
	}

	async getFiltersFromQueryParams(): Promise<void> {
		return new Promise<void>(resolve => {
			// Check if current url already has a query param set
			const queryParams = queryString.parse(this.location.search);
			try {
				if (!queryParams.filters && !queryParams.orderProperty && !queryParams.orderDirection) {
					resolve();
				}
				const newState: SearchState = cloneDeep(this.state);
				if (queryParams.query) {
					newState.formState = JSON.parse(queryParams.filters as string);
				}
				newState.orderProperty = (queryParams.orderProperty || 'relevance') as SearchOrderProperty;
				newState.orderDirection = (queryParams.orderProperty || 'desc') as SearchOrderDirection;
				newState.currentPage = parseInt((queryParams.page as string) || '1', 10) - 1;
				this.setState(newState, resolve);
			} catch (err) {
				// TODO show toast error: Ongeldige zoek query
				resolve();
			}
		});
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
			this.state.orderDirection === 'desc' ? null : `orderProperty=${this.state.orderDirection}`;
		const page = this.state.currentPage === 0 ? null : `page=${this.state.currentPage + 1}`;

		const queryParams: string = compact([filters, orderProperty, orderDirection, page]).join('&');
		this.history.push({
			pathname: '/search',
			search: queryParams.length ? `?${queryParams}` : '',
		});
	}

	handleFilterOptionSearchChange = (event: ChangeEvent) => {
		const target = event.target as HTMLInputElement;
		if (target) {
			const { name, value } = target;
			setDeepState(this, `filterOptionSearch.${name}`, value).then(noop);
		}
	};

	handleFilterFieldChange = async (value: string | string[] | DateRange | null, id: string) => {
		if (value) {
			await setDeepState(this, `formState.${id}`, value);
		} else {
			await unsetDeepState(this, `formState.${id}`);
		}
	};

	handleOrderChanged = (value: string = 'relevance_desc') => {
		const valueParts: string[] = value.split('_');
		const orderProperty: string = valueParts[0];
		const orderDirection: string = valueParts[1];
		this.setState(
			{
				orderProperty: orderProperty as SearchOrderProperty,
				orderDirection: orderDirection as SearchOrderDirection,
			},
			async () => {
				await this.submitSearchForm();
			}
		);
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

		// Parse values from formState into a parsed object that we'll send to the proxy search endpoint
		const filterOptionSearch: Partial<FilterOptionSearch> = this.cleanupFilterObject(
			cloneDeep(this.state.filterOptionSearch)
		);

		// TODO do the search by dispatching a redux action
		return await doSearch(
			filterOptions,
			filterOptionSearch,
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
		disabled: boolean = false
	): ReactNode {
		const multiOptions = (this.state.multiOptions[propertyName] || []).map(
			(option: OptionProp): CheckboxOption => {
				let label = capitalize(option.option_name);
				if (propertyName === 'language') {
					label = capitalize(LANGUAGES.nl[option.option_name] || option.option_name);
				}
				return {
					label: `${label} (${option.option_count})`,
					id: option.option_name,
					checked: false,
				};
			}
		);

		return (
			<li style={{ display: 'flex' }}>
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

		// <input
		// type="text"
		// id={propertyName}
		// name={propertyName}
		// placeholder="Filter options"
		// onChange={this.handleFilterOptionSearchChange}
		// style={{ display: 'block', width: '100%' }}
		// />

		// optionsCallback={this.getFilterOptions}
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
				{this.renderDateRangeDropdown('Uitzenddatum', 'broadcastDate')}
				{this.renderCheckboxDropdown('Taal', 'language')}
				{this.renderCheckboxModal('Onderwerp', 'keyword')}
				{this.renderCheckboxModal('Vak', 'subject')}
				{this.renderCheckboxModal('Serie', 'serie')}
				{this.renderCheckboxDropdown('Aanbieder', 'provider', true)}
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
						label: `${this.formatDate(filterValue.gte)} - ${this.formatDate(filterValue.lte)}`,
						prop: filterProp,
						value: filterValue,
					},
				];
			}
			if (filterValue.gte) {
				return [
					{
						label: `na ${this.formatDate(filterValue.gte)}`,
						prop: filterProp,
						value: filterValue,
					},
				];
			}
			if (filterValue.lte) {
				return [
					{
						label: `voor ${this.formatDate(filterValue.lte)}`,
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
				return {
					label: filterVal,
					prop: filterProp,
					value: filterVal,
				};
			});
		}

		console.error('Failed to render selected filter: ', filterProp, filterValue);
		return [];
	}

	/**
	 * Converts a date from format 2000-12-31 to 31/12/2000
	 */
	formatDate(dateString: string): string {
		return reverse(dateString.split('-')).join('/');
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

	private renderSearchResults() {
		return (
			<ul className="c-search-result-list">
				{this.state.results.items.map(result => (
					<li key={result.pid}>
						<div className="c-search-result">
							<div className="c-search-result__image">
								<img src={result.thumbnail_path} style={{ maxWidth: '300px' }} alt="" />
							</div>
							<div className="c-search-result__content">
								<span className="title">{result.dc_title}</span>
								<br />
								<span className="title">{result.dcterms_issued}</span>
								<br />
								<br />
								<br />
							</div>
						</div>
					</li>
				))}
			</ul>
		);
	}

	private setPage = async (pageIndex: number): Promise<void> => {
		await setDeepState(this, 'currentPage', pageIndex);
		this.setFiltersInQueryParams();
		await this.submitSearchForm();
	};

	render() {
		const orderOptions = [
			{ label: 'Meest relevant', value: 'relevance_desc' },
			{ label: 'Meest bekeken', value: 'views_desc' },
			{ label: 'Uitzenddatum aflopend', value: 'broadcastDate_desc' },
			{ label: 'Uitzenddatum oplopend', value: 'broadcastDate_asc' },
			{ label: 'Laatst toegevoegd', value: 'addedDate_desc' },
			{ label: 'Laatst gewijzigd', value: 'editDate_desc' },
		];
		const resultsCount = this.state.results.count;
		const pageCount = Math.ceil(resultsCount / ITEMS_PER_PAGE);
		const resultStart = this.state.currentPage * ITEMS_PER_PAGE;
		const resultEnd = Math.min(resultStart + ITEMS_PER_PAGE, resultsCount);

		return (
			<Container mode={'horizontal'}>
				<Navbar>
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
										onChange={value => this.handleOrderChanged(value)}
									/>
								</FormGroup>
							</Form>
						</ToolbarRight>
					</Toolbar>
				</Navbar>
				<Navbar autoHeight={true}>
					<Container>
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
					<Container>
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
