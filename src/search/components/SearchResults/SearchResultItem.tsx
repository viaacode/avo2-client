import React from 'react';
import { Link } from 'react-router-dom';

import {
	SearchResult,
	SearchResultSubtitle,
	SearchResultThumbnail,
	SearchResultTitle,
	Thumbnail,
} from '@viaa/avo2-components';

import { dutchContentLabelToEnglishLabel } from '../../../collection/types';
import { formatDate } from '../../../shared/helpers/formatters/date';
import {
	generateContentLinkString,
	generateSearchLink,
} from '../../../shared/helpers/generateLink';
import { SearchResultItemProps } from './types';

const SearchResultItem = ({
	handleBookmarkToggle,
	handleOriginalCpLinkClicked,
	result,
}: SearchResultItemProps) => {
	const contentLink: string = generateContentLinkString(result.administrative_type, result.id);

	return (
		<SearchResult
			key={`search-result-${result.id}`}
			type={dutchContentLabelToEnglishLabel(result.administrative_type)}
			date={formatDate(result.dcterms_issued)}
			tags={[{ label: 'Redactiekeuze', id: 'redactiekeuze' }, { label: 'Partner', id: 'partner' }]}
			viewCount={412}
			bookmarkCount={85}
			description={result.dcterms_abstract}
			onToggleBookmark={(active: boolean) => handleBookmarkToggle(result.id, active)}
		>
			<SearchResultTitle>
				<Link to={contentLink}>{result.dc_title}</Link>
			</SearchResultTitle>
			<SearchResultSubtitle>
				{generateSearchLink('provider', result.original_cp, 'c-body-2', () =>
					handleOriginalCpLinkClicked(result.original_cp)
				)}
			</SearchResultSubtitle>
			<SearchResultThumbnail>
				<Link to={contentLink}>
					<Thumbnail
						category={dutchContentLabelToEnglishLabel(result.administrative_type)}
						src={result.thumbnail_path}
						label={result.administrative_type}
					/>
				</Link>
			</SearchResultThumbnail>
		</SearchResult>
	);
};

export default SearchResultItem;
