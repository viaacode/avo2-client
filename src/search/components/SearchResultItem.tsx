import { compact, get } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import {
	SearchResult,
	SearchResultSubtitle,
	SearchResultThumbnail,
	SearchResultTitle,
	TagOption,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { toEnglishContentType } from '../../collection/collection.types';
import {
	CustomError,
	formatDate,
	generateContentLinkString,
	generateSearchLink,
} from '../../shared/helpers';

import { SearchResultItemProps } from '../search.types';

const SearchResultItem: FunctionComponent<SearchResultItemProps> = ({
	handleBookmarkToggle,
	handleTagClicked,
	handleOriginalCpLinkClicked,
	result,
	isBookmarked,
	collectionLabelLookup,
}) => {
	const contentLink: string = generateContentLinkString(result.administrative_type, result.id);

	const getTags = (result: Avo.Search.ResultItem): TagOption[] => {
		return compact(
			(get(result, 'collection_labels', []) as string[]).map((id: string) => {
				if (collectionLabelLookup[id]) {
					return {
						id,
						label: collectionLabelLookup[id],
					};
				}
				console.error(
					new CustomError('Failed to map collection label id to collection label', null, {
						id,
						collectionLabelLookup,
					})
				);
				return null;
			})
		);
	};

	return (
		<SearchResult
			key={`search-result-${result.id}`}
			type={toEnglishContentType(result.administrative_type)}
			date={formatDate(result.dcterms_issued)}
			tags={getTags(result)}
			viewCount={result.views_count || 0}
			bookmarkCount={result.bookmarks_count || 0}
			description={result.dcterms_abstract || ''}
			isBookmarked={isBookmarked}
			onToggleBookmark={(active: boolean) => handleBookmarkToggle(result.uid, active)}
			onTagClicked={handleTagClicked}
		>
			<SearchResultTitle>
				<Link to={contentLink}>{result.dc_title}</Link>
			</SearchResultTitle>
			{!!result.original_cp && (
				<SearchResultSubtitle>
					{generateSearchLink('provider', result.original_cp, 'c-body-2', () =>
						handleOriginalCpLinkClicked(result.id, result.original_cp || '')
					)}
				</SearchResultSubtitle>
			)}
			<SearchResultThumbnail>
				<Link to={contentLink}>
					<Thumbnail
						category={toEnglishContentType(result.administrative_type)}
						src={result.thumbnail_path}
						label={result.administrative_type}
					/>
				</Link>
			</SearchResultThumbnail>
		</SearchResult>
	);
};

export default SearchResultItem;
