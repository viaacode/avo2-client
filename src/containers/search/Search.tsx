import React, { ChangeEvent, Component } from 'react';
import * as _ from '../../helpers/lodash-imports';
import { setPartialState } from '../../helpers/setPartialState';
import * as searchActions from '../../redux/search/searchActions';
import { IFilterItem, IFilterResponse, IFilters } from '../../types';

type SearchProps = {};

type SearchState = {
	formState: {
		searchTerm: string;
		typeIds: string[];
		educationLevelIds: string[];
		fromYear: string;
		toYear: string;
	};
	searchResults: IFilterItem[];
};

export class Search extends Component<{}, SearchState> {
	constructor(props: SearchProps, state: SearchState) {
		super(props, state);
		this.state = {
			formState: {
				searchTerm: '',
				typeIds: [],
				educationLevelIds: [],
				fromYear: '',
				toYear: '',
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
		const filterOptions: Partial<IFilters> = {};
		if (!_.isEmpty(this.state.formState.searchTerm)) {
			filterOptions.searchTerm = this.state.formState.searchTerm;
		}
		if (!_.isEmpty(this.state.formState.typeIds)) {
			filterOptions.typeIds = this.state.formState.typeIds.map(parseInt);
		}
		if (!_.isEmpty(this.state.formState.educationLevelIds)) {
			filterOptions.educationLevelIds = this.state.formState.educationLevelIds.map(parseInt);
		}
		if (this.state.formState.fromYear) {
			_.set(
				filterOptions,
				'broadcastDate.from',
				new Date(1, 0, parseInt(this.state.formState.fromYear, 10)).toISOString()
			);
		}
		if (this.state.formState.toYear) {
			_.set(
				filterOptions,
				'broadcastDate.until',
				new Date(1, 0, parseInt(this.state.formState.toYear, 10)).toISOString()
			);
		}

		// TODO do the search by dispatching a redux action
		const searchResponse: IFilterResponse = await searchActions.doSearch(filterOptions, 0, 10);

		this.setState({ searchResults: searchResponse.results });
	};

	render() {
		return (
			<div className="search-page">
				<div>search page works</div>
				<div className="filters">
					<h2>Filters</h2>

					<input
						name="searchTerm"
						id="searchTerm"
						placeholder="Search term"
						onChange={this.handleFilterFieldChange}
					/>

					<select
						multiple
						id="typeIds"
						name="typeIds"
						onChange={this.handleFilterFieldChange}
						defaultValue={['typeIds']}
					>
						<option disabled value="typeIds">
							Type
						</option>
						<option value="video">Video</option>
						<option value="audio">Audio</option>
						<option value="collection">Collectie</option>
						<option value="map">Map</option>
					</select>

					<select
						multiple
						id="educationLevelIds"
						name="educationLevelIds"
						onChange={this.handleFilterFieldChange}
						defaultValue={['educationLevelIds']}
					>
						<option disabled value="educationLevelIds">
							Onderwijsniveau
						</option>
						<option value="video">Video</option>
						<option value="audio">Audio</option>
						<option value="collection">Collectie</option>
						<option value="map">Map</option>
					</select>

					<input
						name="fromYear"
						id="fromYear"
						type="number"
						placeholder="fromYear"
						onChange={this.handleFilterFieldChange}
					/>

					<input
						name="toYear"
						id="toYear"
						type="number"
						placeholder="toYear"
						onChange={this.handleFilterFieldChange}
					/>

					<button onClick={this.submitSearchForm}>Search</button>
				</div>
				<div>
					<h2>Results</h2>
					<div className="results-container" />
				</div>
			</div>
		);
	}
}
