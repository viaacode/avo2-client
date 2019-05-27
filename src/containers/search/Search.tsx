import { capitalize, cloneDeep, isEmpty, isNil, omitBy } from 'lodash-es';
import React, { ChangeEvent, Component } from 'react';
import { setPartialState } from '../../helpers/setPartialState';
import * as searchActions from '../../redux/search/searchActions';
import { IFilters, ISearchResponse, ISearchResultItem } from '../../types';

type SearchProps = {};

type SearchState = {
	formState: IFilters;
	multiOptions: { [key: string]: string[] };
	searchResults: ISearchResultItem[];
};

export class Search extends Component<{}, SearchState> {
	constructor(props: SearchProps, state: SearchState) {
		super(props, state);
		this.state = {
			formState: {
				query: 'wie verdient er aan uw schulden',
				administrative_type: ['video', 'audio'],
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
				original_cp: [],
			},
			// TODO get these from an API
			multiOptions: {
				administrative_type: ['video', 'audio', 'collection', 'folder'],
				'lom_typical_age_range.filter': [
					'Secundair 1de graad',
					'Secundair 2de graad',
					'Secundair 3de graad',
				],
				'lom_context.filter': [
					'Lager onderwijs',
					'Kleuter onderwijs',
					'Secundair onderwijs',
					'Hoger onderwijs',
				],
				lom_languages: ['nl', 'fr', 'en'],
				'lom_keywords.filter': [
					'armoede',
					'schulden',
					'afbetaling',
					'armoedegrens',
					'economie',
					'factuur',
					'geld',
					'gerechtsdeurwaarder',
					'kansarmoede',
					'rekening',
					'schuldbemiddeling',
					'veiling',
					'voedselbank',
					'voedselbedeling',
				],
				'lom_classification.filter': [
					'PAV - MAVO - GASV - ASPV',
					'economie - SEI - boekhouding - bedrijfsbeheer',
					'gedrags- en cultuurwetenschappen',
					'levensbeschouwing',
					'politieke en sociale wetenschappen - maatschappijleer',
					'handel - kantoor - verkoop',
					'psychologie en pedagogie',
					'recht',
					'wijsbegeerte en moraalwetenschappen',
				],
				'dc_titles_serie.filter': ['Pano', 'Panorama'],
				original_cp: ['VRT'],
			},
			searchResults: [],
		};
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
		let filterOptions: Partial<IFilters> = cloneDeep(this.state.formState);

		filterOptions = omitBy(filterOptions, value => isEmpty(value) || isNil(value));

		// TODO do the search by dispatching a redux action
		const searchResponse: ISearchResponse = await searchActions.doSearch(filterOptions, 0, 10);

		console.log('results: ', searchResponse.results);

		this.setState({ searchResults: searchResponse.results });
	};

	renderMultiSelect(label: string, propertyName: keyof IFilters) {
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
				{this.state.multiOptions[propertyName].map(option => (
					<option value={option} key={option}>
						{capitalize(option)}
					</option>
				))}
				;
			</select>
		);
	}

	render() {
		return (
			<div className="search-page">
				<div>search page works</div>
				<div className="filters">
					<h2>Filters</h2>
					<input
						name="query"
						id="query"
						placeholder="Search term"
						value={this.state.formState.query}
						onChange={this.handleFilterFieldChange}
					/>
					{this.renderMultiSelect('Type', 'administrative_type')}
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
					{this.renderMultiSelect('Aanbieder', 'original_cp')}
					<button onClick={this.submitSearchForm}>Search</button>
				</div>
				<div>
					<h2>Results</h2>
					<div className="results-container" />
					{this.state.searchResults.map(result => (
						<div key={result.pid}>
							<span className="title">{result.dc_title}</span>
							<img src={result.thumbnail_path} />
						</div>
					))}
				</div>
			</div>
		);
	}
}
