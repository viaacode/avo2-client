import { find, get, isNil } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import {
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Flex,
	Heading,
	MenuSearchResultContent,
	MenuSearchResultItemInfo,
	Spacer,
	Spinner,
	TextInput,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { toEnglishContentType } from '../../collection/collection.types';
import { getSearchResults } from '../../search/store/actions';
import { selectSearchLoading, selectSearchResults } from '../../search/store/selectors';
import {
	generateContentLinkString,
	generateSearchLinkString,
	useDebounce,
} from '../../shared/helpers';
import toastService from '../../shared/services/toast-service';

import './Home.scss';

interface HomeProps extends DefaultSecureRouteProps {
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
	const [t] = useTranslation();

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
			type: toEnglishContentType(searchResult.administrative_type),
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
				toastService.danger(`Geen zoekresultaten gevonden met id: ${searchResultId}`);
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
						<Heading type="h2" className="u-text-center">
							<Trans key="home/views/home___vind-alles-wat-je-nodig-hebt-om-je-lessen-te-verrijken">
								Vind alles wat je nodig hebt om je lessen te verrijken.
							</Trans>
						</Heading>
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
									</DropdownContent>
								</Dropdown>
							</Spacer>
							<Spacer margin="large">
								<p className="c-body-1">
									<Trans key="home/views/home___vind-inspiratie-voor-specifieke-vakken-en-domeinen">
										Vind inspiratie voor specifieke vakken en domeinen:
									</Trans>
								</p>
								<Flex className="c-button-toolbar" orientation="horizontal" center>
									{/* TODO discover/overview-basic.html */}
									<Button label={t('home/views/home___basisonderwijs')} type="secondary" />
									{/* TODO discover/overview-secondary.html */}
									<Button label={t('home/views/home___secundair-onderwijs')} type="secondary" />
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
