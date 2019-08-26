import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Dispatch } from 'redux';

import { find, get, isNil, isNumber, isString } from 'lodash-es';

import './Home.scss';

import {
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	MenuSearchResultContent,
	MenuSearchResultItemInfo,
	Spacer,
	Spinner,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { getSearchResults } from '../../search/store/actions';
import { selectSearchLoading, selectSearchResults } from '../../search/store/selectors';
import {
	generateContentLinkString,
	generateSearchLinkString,
} from '../../shared/helpers/generateLink';
import { useDebounce } from '../../shared/helpers/useDebounce';

interface HomeProps extends RouteComponentProps {
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

const ITEMS_IN_AUTOCOMPLETE = 5;

const Home: FunctionComponent<HomeProps> = ({
	searchResults,
	searchResultsLoading,
	search,
	history,
}) => {
	const [searchTerms, setSearchTerms] = useState('');
	const [isAutocompleteSearchOpen, setAutocompleteSearchOpen] = useState(false);
	const debouncedSearchTerms = useDebounce(searchTerms, 200);

	/**
	 * Trigger a new call to the backend for getting new search results when the searchTerms change
	 */
	useEffect(() => {
		// Only do initial search after query params have been analysed and have been added to the state
		search(
			'relevance',
			'desc',
			0,
			ITEMS_IN_AUTOCOMPLETE,
			{
				query: debouncedSearchTerms || '',
			},
			{}
		);
	}, [debouncedSearchTerms, search]);

	const goToSearchResult = (searchResultId: string | undefined) => {
		if (!isNil(searchResultId)) {
			// Collection ids are numbers and item ids are strings
			const searchResultItem: Avo.Search.ResultItem | undefined = find(
				get(searchResults, 'results', []),
				{
					id: searchResultId.toString(),
				}
			) as Avo.Search.ResultItem | undefined;
			if (searchResultItem) {
				history.push(
					generateContentLinkString(searchResultItem.administrative_type, searchResultItem.id)
				);
			} else {
				// TODO show error toast
				console.error('Failed to find search result with id: ', searchResultId);
			}
		}
	};

	const autocompleteMenuItems = (get(searchResults, 'results', []) as Avo.Search.ResultItem[]).map(
		(searchResult: Avo.Search.ResultItem): MenuSearchResultItemInfo => ({
			label: searchResult.dc_title,
			id: searchResult.external_id as string,
			type: searchResult.administrative_type,
		})
	);

	const handleSearchTermChanged = (searchTerm: string) => {
		setSearchTerms(searchTerm);
		setAutocompleteSearchOpen(true);
	};

	return (
		<div className="m-home-page">
			<Container mode="vertical" background="alt">
				<Container mode="horizontal" size="medium">
					<Spacer>
						<h2 className="c-h2 u-text-center">
							Vind alles wat je nodig hebt om je lessen te verrijken.
						</h2>
						<div className="u-text-center">
							<Spacer margin="large">
								<Dropdown
									isOpen={isAutocompleteSearchOpen}
									onOpen={() => setAutocompleteSearchOpen(true)}
									onClose={() => setAutocompleteSearchOpen(false)}
								>
									<DropdownButton>
										<TextInput
											placeholder="Vul een zoekterm in"
											icon="search"
											value={searchTerms}
											onChange={searchTerm => handleSearchTermChanged(searchTerm)}
										/>
									</DropdownButton>
									<DropdownContent>
										<div className="c-menu--search-result">
											{!searchResultsLoading && (
												<MenuSearchResultContent
													menuItems={autocompleteMenuItems}
													noResultsLabel="Geen resultaten"
													onClick={id => goToSearchResult(id.toString())}
												/>
											)}
											{searchResultsLoading && <Spinner size="large" />}
											<div className="c-menu__footer">
												<Link
													className="c-button c-button--secondary c-button--block"
													to={generateSearchLinkString('query', searchTerms)}
												>
													<div className="c-button__label">
														{autocompleteMenuItems.length
															? 'Alle zoekresultaten'
															: 'Ga naar de zoek pagina'}
													</div>
												</Link>
											</div>
										</div>
									</DropdownContent>
								</Dropdown>
							</Spacer>
							<Spacer margin="large">
								<p className="c-body-1">Vind inspiratie voor specifieke vakken en domeinen:</p>
								<div className="c-button-toolbar o-flex--horizontal-center">
									{/* TODO discover/overview-basic.html */}
									<Button label="Basisonderwijs" type="secondary" />
									{/* TODO discover/overview-secondary.html */}
									<Button label="Secundair onderwijs" type="secondary" />
								</div>
							</Spacer>
						</div>
					</Spacer>
				</Container>
			</Container>
		</div>
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
)(Home);
