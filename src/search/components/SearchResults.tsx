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
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { isNil } from 'lodash-es';
import React, { type FC } from 'react';

import { GET_DEFAULT_PAGINATION_BAR_PROPS } from '../../admin/shared/components/PaginationBar/PaginationBar.consts';
import placeholderImage from '../../assets/images/assignment-placeholder.png';
import { PermissionService } from '../../authentication/helpers/permission-service';
import withUser, { type UserProps } from '../../shared/hocs/withUser';
import useTranslation from '../../shared/hooks/useTranslation';
import { CONTENT_TYPE_TO_EVENT_CONTENT_TYPE_SIMPLIFIED } from '../../shared/services/bookmarks-views-plays-service';
import { ITEMS_PER_PAGE } from '../search.const';
import { type SearchResultsProps } from '../search.types';

import SearchResultItem from './SearchResultItem';

const SearchResults: FC<SearchResultsProps & UserProps> = ({
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
	commonUser,
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

	const renderResultsOrNoResults = () => {
		if (loading) {
			return (
				<Flex orientation="horizontal" center>
					<Spinner size="large" />
				</Flex>
			);
		}
		if (data && data.results && data.count !== 0) {
			return (
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
							onScrollToTop={() => window.scrollTo(0, 0)}
						/>
					</Spacer>
				</>
			);
		}
		if (PermissionService.hasPerm(commonUser, PermissionName.REQUEST_MEDIA_ITEM_IN_SEARCH)) {
			// Not pupils
			return (
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
			);
		} else {
			// Pupils
			return (
				<Blankslate
					body=""
					icon={IconName.search}
					title={tHtml(
						'search/components/search-results___we-vonden-jammer-genoeg-geen-resultaten-voor-jouw-zoekopdracht-probeer-een-andere-schrijfwijze-of-een-synoniem-of-beperk-het-aantal-filters'
					)}
				/>
			);
		}
	};

	return (
		<Container mode="vertical">
			<Container mode="horizontal">{renderResultsOrNoResults()}</Container>
		</Container>
	);
};

export default withUser(SearchResults) as FC<SearchResultsProps>;
