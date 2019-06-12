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
} from 'lodash-es';
import queryString from 'query-string';
import React, { ChangeEvent, Component } from 'react';
import { RouteComponentProps, StaticContext } from 'react-router';
import { setDeepState } from '../../helpers/setDeepState';
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

import { TextInput } from '../../components/avo2-components/src';

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

	handleFilterFieldChange = (value: string | string[], id: string) => {
		setDeepState(this, `formState.${id}`, value).then(noop);
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
					onChange={changeEvent =>
						this.handleFilterFieldChange(
							([...changeEvent.target.selectedOptions] as unknown) as string[],
							propertyName
						)
					}
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
				<TextInput
					id="query"
					placeholder="Search term"
					defaultValue={this.state.formState.query}
					onChange={value => this.handleFilterFieldChange(value, 'query')}
				/>
				{this.renderMultiSelect('Type', 'type')}
				{this.renderMultiSelect('Onderwijsniveau', 'educationLevel')}
				{this.renderMultiSelect('Domein', 'domain')}
				<div style={{ display: 'inline-block', margin: '15px' }}>
					<TextInput
						id="broadcastDate.gte"
						placeholder="after"
						defaultValue={get(this.state, 'formState.broadcastDate.gte')}
						onChange={value => this.handleFilterFieldChange(value, 'broadcastDate.gte')}
					/>
					<TextInput
						id="broadcastDate.lte"
						placeholder="before"
						defaultValue={get(this.state, 'formState.broadcastDate.lte')}
						onChange={value => this.handleFilterFieldChange(value, 'broadcastDate.lte')}
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
