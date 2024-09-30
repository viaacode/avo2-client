import { PaginationBar } from '@meemoo/react-components';
import {
	Blankslate,
	Button,
	Container,
	Flex,
	IconName,
	Spacer,
	Spinner,
} from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { isNil } from 'lodash-es';
import React, { type FunctionComponent } from 'react';

import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts';
import placeholderImage from '../../assets/images/assignment-placeholder.png';
import useTranslation from '../../shared/hooks/useTranslation';
import { CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED } from '../../shared/services/bookmarks-views-plays-service';
import { ITEMS_PER_PAGE } from '../search.const';
import { type SearchResultsProps } from '../search.types';

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
	qualityLabels,
	...resultProps
}) => {
	const { tText, tHtml } = useTranslation();

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

	const renderSearchResultItem = (result: Avo.Search.ResultItem) => {
		const searchResult = { ...result };

		if (result.administrative_type === 'opdracht' && isNil(searchResult.thumbnail_path)) {
			searchResult.thumbnail_path = placeholderImage;
		}

		return (
			<SearchResultItem
				{...resultProps}
				id={result.uid}
				key={`search-result-item-${result.uid}`}
				result={searchResult}
				qualityLabelLookup={Object.fromEntries(
					qualityLabels.map((item) => [item.value, item.description])
				)}
				isBookmarked={getIsBookmarked(result)}
				bookmarkButton={bookmarkButtons}
				renderDetailLink={renderDetailLink}
				renderSearchLink={renderSearchLink}
			/>
		);
	};

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
							<PaginationBar
								{...GET_DEFAULT_PAGINATION_BAR_PROPS()}
								startItem={currentPage * ITEMS_PER_PAGE}
								itemsPerPage={ITEMS_PER_PAGE}
								totalItems={pageCount * ITEMS_PER_PAGE}
								onPageChange={setPage}
							/>
						</Spacer>
					</>
				) : (
					<Blankslate
						body=""
						icon={IconName.search}
						title={tHtml(
							'search/components/search-results___er-zijn-geen-zoekresultaten-die-voldoen-aan-uw-filters'
						)}
					>
						<Button
							label={tText('search/components/search-results___vraag-een-item-aan')}
							onClick={navigateUserRequestForm}
						/>
					</Blankslate>
				)}
			</Container>
		</Container>
	);
};

export default SearchResults;
