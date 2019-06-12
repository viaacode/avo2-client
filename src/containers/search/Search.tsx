import { History, Location } from 'history';
import {
	capitalize,
	cloneDeep,
	every,
	get,
	isArray,
	isEmpty,
	isNil,
	isPlainObject,
	noop,
	pickBy,
	remove,
} from 'lodash-es';
import queryString from 'query-string';
import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';
import { setDeepState, unsetDeepState } from '../../helpers/setDeepState';
import { doSearch } from '../../redux/search/searchActions';
import {
	FilterOptionSearch,
	Filters,
	OptionProp,
	SearchOrderDirection,
	SearchOrderProperty,
	SearchResponse,
	SearchResultItem,
} from '../../types';

type SearchProps = {};

interface SearchState extends StaticContext {
	formState: Filters;
	filterOptionSearch: FilterOptionSearch;
	orderProperty: SearchOrderProperty;
	orderDirection: SearchOrderDirection;
	multiOptions: { [key: string]: OptionProp[] };
	searchResults: SearchResultItem[];
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
			searchResults: [],
		};
	}

	async componentDidMount() {
		await this.checkFiltersInQueryParams();

		this.submitSearchForm().then(noop);
	}

	async checkFiltersInQueryParams(): Promise<void> {
		return new Promise<void>(resolve => {
			// Check if current url already has a query param set
			const queryParams = queryString.parse(this.location.search);
			try {
				if (!queryParams.query && !queryParams.orderProperty && !queryParams.orderDirection) {
					resolve();
				}
				const newState: SearchState = cloneDeep(this.state);
				if (queryParams.query) {
					newState.formState = JSON.parse(queryParams.query as string);
				}
				newState.orderProperty = (queryParams.orderProperty || 'relevance') as SearchOrderProperty;
				newState.orderDirection = (queryParams.orderProperty || 'desc') as SearchOrderDirection;
				this.setState(newState, resolve);
			} catch (err) {
				// TODO show toast error: Ongeldige zoek query
				resolve();
			}
		});
	}

	handleFilterOptionSearchChange = (event: ChangeEvent) => {
		const target = event.target as HTMLInputElement;
		if (target) {
			const { name, value } = target;
			setDeepState(this, `filterOptionSearch.${name}`, value).then(noop);
		}
	};

	handleFilterFieldChange = (event: ChangeEvent) => {
		const target: any = event.target;
		if (target) {
			const name = target.name;
			let value: any;

			if (target.selectedOptions) {
				value = [...target.selectedOptions].map(o => o.value);
			} else {
				value = target.value;
			}

			setDeepState(this, `formState.${name}`, value).then(noop);
		} else {
			console.error('Change event without a value: ', event);
		}
	};

	handleOrderChanged = (event: ChangeEvent) => {
		const value = get(event, 'target.value') || 'relevance_desc';
		const valueParts = value.split('_');
		const orderProperty = valueParts[0];
		const orderDirection = valueParts[1];
		this.setState(
			{
				orderProperty,
				orderDirection,
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

	submitSearchForm = async () => {
		try {
			// Parse values from formState into a parsed object that we'll send to the proxy search endpoint
			const filterOptions: Partial<Filters> = this.cleanupFilterObject(
				cloneDeep(this.state.formState)
			);

			// Parse values from formState into a parsed object that we'll send to the proxy search endpoint
			const filterOptionSearch: Partial<FilterOptionSearch> = this.cleanupFilterObject(
				cloneDeep(this.state.filterOptionSearch)
			);

			// Remember this search by adding it to the query params in the url
			this.history.push({
				pathname: '/search',
				search:
					`?query=${JSON.stringify(filterOptions)}` +
					`&orderProperty=${this.state.orderProperty}` +
					`&orderDirection=${this.state.orderDirection}`,
			});

			// TODO do the search by dispatching a redux action
			const searchResponse: SearchResponse = await doSearch(
				filterOptions,
				filterOptionSearch,
				this.state.orderProperty,
				this.state.orderDirection,
				0,
				10
			);

			this.setState({
				...this.state,
				multiOptions: searchResponse.aggregations,
				searchResults: searchResponse.results || [],
			});
		} catch (err) {
			// TODO show error toast
		}
	};

	renderMultiSelect(label: string, propertyName: keyof Filters) {
		return (
			<div style={{ display: 'inline-block', margin: '15px' }}>
				<input
					type="text"
					id={propertyName}
					name={propertyName}
					placeholder="Filter options"
					onChange={this.handleFilterOptionSearchChange}
					style={{ display: 'block', width: '100%' }}
				/>
				<select
					multiple
					id={propertyName}
					name={propertyName}
					key={propertyName}
					value={this.state.formState[propertyName] as any}
					onChange={this.handleFilterFieldChange}
					style={{ display: 'block', width: '100%' }}
				>
					<option value="" key="default">
						{label}
					</option>
					{(this.state.multiOptions[propertyName] || []).map((option: OptionProp) => (
						<option value={option.option_name} key={option.option_name}>
							{capitalize(option.option_name)} ({option.option_count})
						</option>
					))}
					;
				</select>
			</div>
		);
	}

	renderFilterControls() {
		return (
			<div>
				<input
					name="query"
					id="query"
					placeholder="Search term"
					value={this.state.formState.query}
					onChange={this.handleFilterFieldChange}
					style={{ margin: '15px' }}
				/>
				{this.renderMultiSelect('Type', 'type')}
				{this.renderMultiSelect('Onderwijsniveau', 'educationLevel')}
				{this.renderMultiSelect('Domein', 'domain')}
				<div style={{ display: 'inline-block', margin: '15px' }}>
					<input
						name="broadcastDate.gte"
						id="broadcastDate.gte"
						type="string"
						placeholder="after"
						value={get(this.state, 'formState.broadcastDate.gte')}
						onChange={this.handleFilterFieldChange}
						style={{ display: 'block' }}
					/>
					<input
						name="broadcastDate.lte"
						id="broadcastDate.lte"
						type="string"
						placeholder="before"
						value={get(this.state, 'formState.broadcastDate.lte')}
						onChange={this.handleFilterFieldChange}
						style={{ display: 'block' }}
					/>
				</div>
				{this.renderMultiSelect('Taal', 'language')}
				{this.renderMultiSelect('Onderwerp', 'keyword')}
				{this.renderMultiSelect('Vak', 'subject')}
				{this.renderMultiSelect('Serie', 'serie')}
				{this.renderMultiSelect('Aanbieder', 'provider')}
			</div>
		);
	}

	renderSelectedFilter(filterProp: keyof Filters, filterValue: any) {
		const filterStyles = {
			margin: '5px',
			padding: '5px',
			backgroundColor: 'grey',
			color: 'white',
			cursor: 'pointer',
		};

		// Do not render query filter or empty filters
		if (
			filterProp === 'query' ||
			filterValue === '' ||
			filterValue === [] ||
			(isArray(filterValue) && every(filterValue, filter => !filter)) // Array of empty strings
		) {
			return null;
		}

		// Render date range option filters
		if (isPlainObject(filterValue)) {
			if (filterValue.gte && filterValue.lte) {
				return (
					<span
						key={`${filterProp}-${filterValue.gte}-${filterValue.lte}`}
						style={filterStyles}
						onClick={() => this.deleteFilter(filterProp, filterValue)}
					>
						{filterValue.gte} - {filterValue.lte}
					</span>
				);
			}
			if (filterValue.gte) {
				return (
					<span
						key={`${filterProp}-${filterValue.gte}`}
						style={filterStyles}
						onClick={() => this.deleteFilter(filterProp, filterValue)}
					>
						na {filterValue.gte}
					</span>
				);
			}
			if (filterValue.gte) {
				return (
					<span
						key={`${filterProp}-${filterValue.lte}`}
						style={filterStyles}
						onClick={() => this.deleteFilter(filterProp, filterValue)}
					>
						voor {filterValue.lte}
					</span>
				);
			}
			return null; // Do not render a filter if date object is empty: {gte: "", lte: ""}
		}

		// Render multi option filters
		if (isArray(filterValue)) {
			return filterValue.map(filterValue => (
				<span
					key={`${filterProp}-${filterValue}`}
					style={filterStyles}
					onClick={() => this.deleteFilter(filterProp, filterValue)}
				>
					{filterValue}
				</span>
			));
		}

		console.error('Failed to render selected filter: ', filterProp, filterValue);
		return null;
	}

	renderSelectedFilters() {
		return (
			<div>
				{(Object.keys(this.state.formState) as (keyof Filters)[]).map((filterProp: keyof Filters) =>
					this.renderSelectedFilter(filterProp, this.state.formState[filterProp])
				)}
			</div>
		);
	}

	async deleteFilter(filterProp: keyof Filters, filterValue: any) {
		if (isPlainObject(filterValue) && (filterValue.gte || filterValue.lte)) {
			await unsetDeepState(this, `formState.${filterProp}`);
			return;
		}
		if (isArray(this.state.formState[filterProp])) {
			const filterArray: string[] = this.state.formState[filterProp] as string[];
			remove(filterArray, filterItem => filterItem === filterValue);
			if (filterArray.length) {
				await setDeepState(this, `formState.${filterProp}`, filterArray);
				return;
			}
			await unsetDeepState(this, `formState.${filterProp}`);
			return;
		}

		console.error('Failed to remove selected filter: ', filterProp, filterValue);
	}

	render() {
		return (
			<div className="search-page">
				<div>
					<label>Sorteer op:</label>
					<select id="order" name="order" onChange={this.handleOrderChanged}>
						<option value="relevance_desc">Meest relevant</option>
						<option disabled value="views_desc">
							Meest bekeken
						</option>
						<option value="broadcastDate_desc">Uitzenddatum aflopend</option>
						<option value="broadcastDate_asc">Uitzenddatum oplopend</option>
						<option disabled value="addedDate_desc">
							Laatst toegevoegd
						</option>
						<option disabled value="editDate_desc">
							Laatst gewijzigd
						</option>
					</select>
				</div>
				<div className="filters">
					<h2>Filters</h2>
					{this.renderSelectedFilters()}
					{this.renderFilterControls()}
					<button onClick={this.submitSearchForm}>Search</button>
				</div>
				<div>
					<h2>Results</h2>
					<div className="results-container" />
					{this.state.searchResults.map(result => (
						<div key={result.pid}>
							<span className="title">{result.dc_title}</span>
							<br />
							<span className="title">{result.dcterms_issued}</span>
							<br />
							<img src={result.thumbnail_path} style={{ maxWidth: '300px' }} alt="" />
							<br />
							<br />
						</div>
					))}
				</div>
			</div>
		);
	}
}
