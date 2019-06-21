import { noop, truncate } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { MetaData, MetaDataItem, TagList, Thumbnail, ToggleButton } from '../..';
import { formatDate, formatDuration } from '../../helpers/formatting';

export interface SearchResultProps {
	pid: string;
	type: 'collection' | 'video' | 'audio';
	thumbnailPath?: string;
	duration?: number;
	numberOfItems?: number;
	description?: string;
	title: string;
	link: string;
	originalCp: string;
	date: string;
	tags?: string[];
	originalCpLink: string;
	onToggleBookmark?: (id: string, active: boolean) => void;
	onTitleLinkClicked?: (id: string, title: string) => void;
	onOriginalCpLinkClicked?: (id: string, originalCp?: string) => void;
	onThumbnailClicked?: (id: string, thumbnailSrc?: string) => void;
}

export const SearchResult: FunctionComponent<SearchResultProps> = ({
	pid: id,
	type,
	thumbnailPath,
	duration = 0,
	numberOfItems = 0,
	description,
	title,
	link,
	originalCp,
	date,
	tags = [],
	originalCpLink,
	onToggleBookmark = noop,
	onTitleLinkClicked = noop,
	onOriginalCpLinkClicked = noop,
	onThumbnailClicked = noop,
}: SearchResultProps) => {
	const metaData = [];
	let thumbnailMeta = '';
	if (type === 'audio' || type === 'video') {
		if (duration) {
			thumbnailMeta = formatDuration(duration || 0);
			metaData.push({
				label: thumbnailMeta,
			});
		}
	} else {
		// TODO get number of items from result item after bart updates the elasticsearch index
		thumbnailMeta = `${numberOfItems} items`;
		metaData.push({
			label: thumbnailMeta,
		});
	}

	return (
		<div className="c-search-result" key={id}>
			<div className="c-search-result__image">
				<Link to={link} onClick={() => onThumbnailClicked(id, thumbnailPath)}>
					<Thumbnail
						category={type}
						src={thumbnailPath}
						meta={thumbnailMeta}
						label={type}
						alt={description}
					/>
				</Link>
			</div>
			<div className="c-search-result__content">
				<div className="o-flex o-flex--justify-between o-flex--align-top">
					<div className="o-flex__item">
						<h2 className="c-search-result__title">
							<Link to={link} onClick={() => onTitleLinkClicked(id, title)}>
								{title}
							</Link>
						</h2>
						<Link to={originalCpLink} onClick={() => onOriginalCpLinkClicked(id, originalCp)}>
							{originalCp}
						</Link>
					</div>
					<div className="o-flex__item o-flex__item--shrink">
						<div className="c-button-toolbar">
							<ToggleButton
								active={false}
								icon="bookmark"
								onClick={(active: boolean) => onToggleBookmark(id, active)}
							/>
							{/*TODO implement bookmark behavior + set initial active*/}
						</div>
					</div>
				</div>
				<p className="c-search-result__description">{truncate(description, { length: 240 })}</p>
				<div className="u-spacer-bottom-s">
					<div className="o-flex o-flex--justify-between o-flex--wrap">
						<MetaData category={type}>
							<MetaDataItem label={formatDate(date)} />
							<MetaDataItem label={String(25)} icon={type === 'audio' ? 'headphone' : 'eye'} />
							{/* TODO get number of views after bart updates the elasticsearch index */}
							{/*<MetaDataItem label={String(25)} icon="bookmark" />*/}
							{/* TODO get number of favorites after bart updates the elasticsearch index */}
						</MetaData>
						<TagList tags={tags} swatches={false} />
						{/* TODO set correct labels */}
					</div>
				</div>
			</div>
		</div>
	);
};
