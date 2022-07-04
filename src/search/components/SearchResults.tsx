import {
	Blankslate,
	Button,
	Container,
	Flex,
	Pagination,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';

import { CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED } from '../../shared/services/bookmarks-views-plays-service';
import { SearchResultsProps } from '../search.types';

import SearchResultItem from './SearchResultItem';

const SearchResults: FunctionComponent<SearchResultsProps> = ({
	currentPage,
	loading,
	data,
	pageCount,
	setPage,
	bookmarkStatuses,
	navigateUserRequestForm,
	bookmarkButtons,
	renderDetailLink,
	renderSearchLink,
	collectionLabels,
	...resultProps
}) => {
	const [t] = useTranslation();

	const getIsBookmarked = (result: Avo.Search.ResultItem) => {
		if (!bookmarkStatuses) {
			return null;
		}
		return (
			bookmarkStatuses[
				CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED[result.administrative_type]
			][result.uid] || false
		);
	};

	const renderSearchResultItem = (result: Avo.Search.ResultItem) => (
		<SearchResultItem
			{...resultProps}
			id={result.external_id}
			key={`search-result-item-${result.external_id}`}
			result={result}
			collectionLabelLookup={Object.fromEntries(
				collectionLabels.map((item) => [item.value, item.description])
			)}
			isBookmarked={getIsBookmarked(result)}
			bookmarkButton={bookmarkButtons}
			renderDetailLink={renderDetailLink}
			renderSearchLink={renderSearchLink}
		/>
	);

	return (
		<Container mode="vertical">
			<Container mode="horizontal">
				{loading ? (
					<Flex orientation="horizontal" center>
						<Spinner size="large" />
					</Flex>
				) : data && data.results && data.count !== 0 ? (
					<>
						<ul className="c-search-result-list">
							{data.results.map(renderSearchResultItem)}
						</ul>
						<Spacer margin="large">
							<Pagination
								pageCount={pageCount}
								currentPage={currentPage}
								onPageChange={setPage}
							/>
						</Spacer>
					</>
				) : (
					<Blankslate
						body=""
						icon="search"
						title={t(
							'search/components/search-results___er-zijn-geen-zoekresultaten-die-voldoen-aan-uw-filters'
						)}
					>
						<Button
							label={t('search/components/search-results___vraag-een-item-aan')}
							onClick={navigateUserRequestForm}
						/>
					</Blankslate>
				)}
			</Container>
		</Container>
	);
};

export default SearchResults;
