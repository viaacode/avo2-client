import { find, get, isNil } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

import {
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	MenuSearchResultContent,
	MenuSearchResultItemInfo,
	Spacer,
	Spinner,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { dutchContentLabelToEnglishLabel } from '../../collection/types';
import { getSearchResults } from '../../search/store/actions';
import { selectSearchLoading, selectSearchResults } from '../../search/store/selectors';
import {
	generateContentLinkString,
	generateSearchLinkString,
} from '../../shared/helpers/generateLink';
import { useDebounce } from '../../shared/helpers/useDebounce';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';

import './Home.scss';

interface HomeProps extends RouteComponentProps {
	searchResults: Avo.Search.Search | null;
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
	const [searchTerms, setSearchTerms] = useState<string>('');
	const [isAutocompleteSearchOpen, setAutocompleteSearchOpen] = useState<boolean>(false);
	const debouncedSearchTerms = useDebounce(searchTerms, 200);

	/**
	 * Trigger a new call to the backend for getting new search results when the searchTerms change
	 */
	useEffect(() => {
		// Only do initial search after query params have been analysed and have been added to the state
		const filters = { query: debouncedSearchTerms || '' };

		search('relevance', 'desc', 0, ITEMS_IN_AUTOCOMPLETE, filters, {});
	}, [debouncedSearchTerms, search]);

	// Computed
	const autocompleteMenuItems = (get(searchResults, 'results', []) as Avo.Search.ResultItem[]).map(
		(searchResult: Avo.Search.ResultItem): MenuSearchResultItemInfo => ({
			label: searchResult.dc_title,
			id: searchResult.external_id,
			type: dutchContentLabelToEnglishLabel(searchResult.administrative_type),
		})
	);

	const autocompleteButtonLabel = autocompleteMenuItems.length
		? 'Alle zoekresultaten'
		: 'Ga naar de zoek pagina';

	// Methods
	const gotoSearchPage = () => {
		history.push(generateSearchLinkString('query', searchTerms));
	};

	const goToSearchResult = (searchResultId: string | undefined) => {
		if (!isNil(searchResultId)) {
			// Collection ids are numbers and item ids are strings
			const searchResultItem: Avo.Search.ResultItem | undefined = find(
				get(searchResults, 'results', []),
				{
					id: searchResultId.toString(),
				}
			);

			if (searchResultItem) {
				history.push(
					generateContentLinkString(searchResultItem.administrative_type, searchResultItem.id)
				);
			} else {
				toastService(`Geen zoekresultaten gevonden met id: ${searchResultId}`, TOAST_TYPE.DANGER);
			}
		}
	};

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
									triggerWidth="full-width"
									isOpen={isAutocompleteSearchOpen}
									onOpen={() => setAutocompleteSearchOpen(true)}
									onClose={() => setAutocompleteSearchOpen(false)}
									searchMenu
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
										<>
											{!searchResultsLoading ? (
												<MenuSearchResultContent
													menuItems={autocompleteMenuItems}
													noResultsLabel="Geen resultaten"
													onClick={id => goToSearchResult(id.toString())}
												/>
											) : (
												<Spinner size="large" />
											)}
											<div className="c-menu__footer">
												<Button
													block
													label={autocompleteButtonLabel}
													onClick={gotoSearchPage}
													type="secondary"
												/>
											</div>
										</>
									</DropdownContent>
								</Dropdown>
							</Spacer>
							<Spacer margin="large">
								<p className="c-body-1">Vind inspiratie voor specifieke vakken en domeinen:</p>
								<Flex className="c-button-toolbar" orientation="horizontal" center>
									{/* TODO discover/overview-basic.html */}
									<Button label="Basisonderwijs" type="secondary" />
									{/* TODO discover/overview-secondary.html */}
									<Button label="Secundair onderwijs" type="secondary" />
								</Flex>
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
