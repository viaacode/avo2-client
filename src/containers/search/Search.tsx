import { capitalize, cloneDeep, forEach, isEmpty, isNil, map, omitBy } from 'lodash-es';
import React, { ChangeEvent, Component } from 'react';
import { setPartialState } from '../../helpers/setPartialState';
import * as searchActions from '../../redux/search/searchActions';
import { FilterOptions, Filters, SearchResponse, SearchResultItem } from '../../types';

type SearchProps = {};

type SearchState = {
	formState: Filters;
	multiOptions: { [key: string]: string[] };
	searchResults: SearchResultItem[];
};

export class Search extends Component<{}, SearchState> {
	constructor(props: SearchProps, state: SearchState) {
		super(props, state);
		this.state = {
			formState: {
				// Default values for filters for easier testing of search api // TODO clear default filters
				query: 'wie verdient er aan uw schulden',
				'administrative_type.filter': ['video', 'audio'],
				'lom_typical_age_range.filter': ['Secundair 2de graad', 'Secundair 3de graad'],
				'lom_context.filter': [],
				dcterms_issued: {
					gte: '2000-01-01', // ISO date string
					lte: '2020-01-01', // ISO date string
				},
				lom_languages: ['nl', 'fr'],
				'lom_keywords.filter': ['armoede'],
				'lom_classification.filter': ['levensbeschouwing'],
				'dc_titles_serie.filter': ['Pano'],
				fragment_duration_seconds: {
					gte: 0,
					lte: 300,
				},
				'original_cp.filter': [],
			},
			multiOptions: {},
			searchResults: [],
		};

		searchActions
			.doSearch(undefined, 0, 30)
			.then((response: Partial<SearchResponse>) => {
				const aggregations: FilterOptions | undefined = response.aggregations;
				if (aggregations) {
					const multiOptions: { [prop: string]: string[] } = {};
					forEach(
						aggregations,
						(values: { option_name: string; option_count: number }[], prop: string) => {
							multiOptions[prop] = map(values, value => {
								return `${value.option_name} (${value.option_count})`;
							});
						}
					);
					this.setState({
						...this.state,
						multiOptions,
						searchResults: response.results || [],
					});
				}
			})
			.catch(err => {
				// TODO show error toast
				console.error(err);
			});
	}

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
			setPartialState(this, `formState.${name}`, value);
		} else {
			console.error('Change event without a value: ', event);
		}
	};

	submitSearchForm = async () => {
		console.log(this.state.formState);

		// Parse values from formState into a parsed object that we'll send to the proxy search endpoint
		let filterOptions: Partial<Filters> = cloneDeep(this.state.formState);

		filterOptions = omitBy(filterOptions, value => isEmpty(value) || isNil(value));

		// TODO do the search by dispatching a redux action
		const searchResponse: SearchResponse = await searchActions.doSearch(filterOptions, 0, 10);

		console.log('results: ', searchResponse.results);

		this.setState({ searchResults: searchResponse.results || [] });
	};

	renderMultiSelect(label: string, propertyName: keyof Filters) {
		return (
			<select
				multiple
				id={propertyName}
				name={propertyName}
				value={this.state.formState[propertyName] as any}
				onChange={this.handleFilterFieldChange}
			>
				<option disabled value="" key="default">
					{label}
				</option>
				{(this.state.multiOptions[propertyName] || []).map(option => (
					<option value={option} key={option}>
						{capitalize(option)}
					</option>
				))}
				;
			</select>
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
				/>
				{this.renderMultiSelect('Type', 'administrative_type.filter')}
				{this.renderMultiSelect('Onderwijsniveau', 'lom_typical_age_range.filter')}
				{this.renderMultiSelect('Domein', 'lom_context.filter')}
				<input
					name="dcterms_issued.gte"
					id="dcterms_issued.gte"
					type="string"
					placeholder="after"
					value={this.state.formState.dcterms_issued.gte}
					onChange={this.handleFilterFieldChange}
				/>
				<input
					name="dcterms_issued.lte"
					id="dcterms_issued.lte"
					type="string"
					placeholder="before"
					value={this.state.formState.dcterms_issued.lte}
					onChange={this.handleFilterFieldChange}
				/>
				{this.renderMultiSelect('Taal', 'lom_languages')}
				{this.renderMultiSelect('Onderwerp', 'lom_keywords.filter')}
				{this.renderMultiSelect('Vak', 'lom_classification.filter')}
				{this.renderMultiSelect('Serie', 'dc_titles_serie.filter')}
				<input
					name="fragment_duration_seconds.gte"
					id="fragment_duration_seconds.gte"
					type="string"
					placeholder="longer than"
					value={this.state.formState.fragment_duration_seconds.gte}
					onChange={this.handleFilterFieldChange}
				/>
				<input
					name="fragment_duration_seconds.lte"
					id="fragment_duration_seconds.lte"
					type="string"
					placeholder="shorter than"
					value={this.state.formState.fragment_duration_seconds.lte}
					onChange={this.handleFilterFieldChange}
				/>
				{this.renderMultiSelect('Aanbieder', 'original_cp.filter')}
			</div>
		);
	}

	render() {
		return (
			<div className="search-page">
				<div>search page works</div>
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
							<img src={result.thumbnail_path} style={{ maxWidth: '300px' }} alt="" />
						</div>
					))}
				</div>
			</div>
		);
	}
}
