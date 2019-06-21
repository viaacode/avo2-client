import { noop, truncate } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { Link } from 'react-router-dom';

import { Button, MetaData, MetaDataItem, TagList, Thumbnail, ToggleButton } from '../..';
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
	onToggleBookmark?: (active: boolean, id: string) => void;
	onOriginalCpLinkClicked?: (originalCp: string) => void;
}

export const SearchResult: FunctionComponent<SearchResultProps> = ({
	pid,
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
	onToggleBookmark = noop,
	onOriginalCpLinkClicked = noop,
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
		<div className="c-search-result" key={pid}>
			<div className="c-search-result__image">
				<Link to={link}>
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
							<Link to={link}>{title}</Link>
						</h2>
						<a onClick={() => onOriginalCpLinkClicked(originalCp)} style={{ cursor: 'pointer' }}>
							{originalCp}
						</a>
					</div>
					<div className="o-flex__item o-flex__item--shrink">
						<div className="c-button-toolbar">
							<ToggleButton
								active={false}
								icon="bookmark"
								onClick={(active: boolean) => onToggleBookmark(active, pid)}
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
