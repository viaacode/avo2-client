import {
	SearchResult,
	SearchResultSubtitle,
	SearchResultThumbnail,
	SearchResultTitle,
	TagOption,
	Thumbnail,
} from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';
import { capitalize, compact, get, startCase, trimStart } from 'lodash-es';
import React, { FunctionComponent } from 'react';

import { toEnglishContentType } from '../../collection/collection.types';
import { formatDate } from '../../shared/helpers';
import { tText } from '../../shared/helpers/translate';
import { SearchResultItemProps } from '../search.types';

import './SearchResultItem.scss';

const SearchResultItem: FunctionComponent<SearchResultItemProps> = ({
	id,
	handleBookmarkToggle,
	handleTagClicked,
	result,
	isBookmarked,
	collectionLabelLookup,
	bookmarkButton,
	renderDetailLink,
	renderSearchLink,
}) => {
	const getTags = (result: Avo.Search.ResultItem): TagOption[] => {
		return compact(
			(get(result, 'collection_labels', []) as string[]).map((id: string) => {
				return {
					id,
					label: collectionLabelLookup[id] || capitalize(startCase(id)),
				};
			})
		);
	};

	const getMetaData = () => {
		if (result.administrative_type === 'video' || result.administrative_type === 'audio') {
			const duration = trimStart(result.duration_time, '0:');
			if (duration.includes(':')) {
				return duration;
			}
			return `0:${duration}`;
		}
		return ''; // TODO wait for https://meemoo.atlassian.net/browse/AVO-1107
	};

	const stripMarkdownLinks = (description: string) => {
		return description.replace(/\[([^\]]+)]\([^)]+\)/gi, '$1');
	};

	const renderThumbnail = (result: Avo.Search.ResultItem) => {
		return (
			<Thumbnail
				category={toEnglishContentType(result.administrative_type)}
				src={result.thumbnail_path}
				label={result.administrative_type}
				meta={getMetaData()}
			/>
		);
	};

	let date: string;
	let dateTooltip: string;
	if (
		result.administrative_type === 'collectie' ||
		result.administrative_type === 'bundel' ||
		result.administrative_type === 'opdracht'
	) {
		date = result.updated_at;
		dateTooltip = tText('search/components/search-result-item___laatst-bijwerking');
	} else {
		date = result.dcterms_issued;
		dateTooltip = tText('search/components/search-result-item___uitzend-datum');
	}
	return (
		<div id={`search-result-${id}`} key={`search-result-${id}`}>
			<SearchResult
				type={toEnglishContentType(result.administrative_type)}
				date={formatDate(date)}
				dateTooltip={dateTooltip}
				tags={getTags(result)}
				viewCount={result.views_count || 0}
				bookmarkCount={bookmarkButton ? result.bookmarks_count || 0 : null}
				description={stripMarkdownLinks(result.dcterms_abstract || '')}
				isBookmarked={bookmarkButton ? isBookmarked : null}
				onToggleBookmark={(active: boolean) => handleBookmarkToggle(result.uid, active)}
				onTagClicked={handleTagClicked}
			>
				<SearchResultTitle>
					{renderDetailLink(result.dc_title, result.id, result.administrative_type)}
				</SearchResultTitle>
				{!!result.original_cp && (
					<SearchResultSubtitle>
						{renderSearchLink(
							result.original_cp,
							{ filters: { provider: [result.original_cp] } },
							'c-body-2'
						)}
					</SearchResultSubtitle>
				)}
				<SearchResultThumbnail>
					{renderDetailLink(
						renderThumbnail(result),
						result.id,
						result.administrative_type
					)}
				</SearchResultThumbnail>
			</SearchResult>
		</div>
	);
};

export default SearchResultItem;
