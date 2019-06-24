import { noop } from 'lodash-es';
import React, { FunctionComponent, ReactNode } from 'react';

import { useSlot } from '../../hooks/useSlot';
import {
	SearchResultSubtitle,
	SearchResultThumbnail,
	SearchResultTitle,
} from './SearchResult.slots';

import { MetaData } from '../MetaData/MetaData';
import { MetaDataItem } from '../MetaDataItem/MetaDataItem';
import { TagList } from '../TagList/TagList';
import { ToggleButton } from '../ToggleButton/ToggleButton';

export interface SearchResultProps {
	children: ReactNode;
	type: 'collection' | 'video' | 'audio';
	thumbnailPath?: string;
	duration?: string;
	numberOfItems?: number;
	description?: string;
	date: string;
	tags?: string[];
	onToggleBookmark?: (active: boolean) => void;
}

export const SearchResult: FunctionComponent<SearchResultProps> = ({
	children,
	type,
	thumbnailPath,
	description,
	date,
	duration = '',
	numberOfItems = 0,
	tags = [],
	onToggleBookmark = noop,
}: SearchResultProps) => {
	const title = useSlot(SearchResultTitle, children);
	const subTitle = useSlot(SearchResultSubtitle, children);
	const thumbnail = useSlot(SearchResultThumbnail, children);

	const metaData = [];
	let thumbnailMeta = '';
	if (type === 'audio' || type === 'video') {
		if (duration) {
			thumbnailMeta = duration;
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
		<div className="c-search-result">
			<div className="c-search-result__image">{thumbnail}</div>
			<div className="c-search-result__content">
				<div className="o-flex o-flex--justify-between o-flex--align-top">
					<div className="o-flex__item">
						<h2 className="c-search-result__title">{title}</h2>
						{subTitle}
					</div>
					<div className="o-flex__item o-flex__item--shrink">
						<div className="c-button-toolbar">
							<ToggleButton
								active={false}
								icon="bookmark"
								onClick={(active: boolean) => onToggleBookmark(active)}
							/>
							{/*TODO implement bookmark behavior + set initial active*/}
						</div>
					</div>
				</div>
				<p className="c-search-result__description">{(description || '').substring(0, 240)}</p>
				<div className="u-spacer-bottom-s">
					<div className="o-flex o-flex--justify-between o-flex--wrap">
						<MetaData category={type}>
							<MetaDataItem label={date} />
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
