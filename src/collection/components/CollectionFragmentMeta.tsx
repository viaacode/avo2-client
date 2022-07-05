import { ItemSchema } from '@viaa/avo2-types/types/item';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { SearchFilter } from '../../search/search.const';
import { buildLink } from '../../shared/helpers';
import { BlockItemComponent } from '../collection.types';

export type CollectionFragmentMetaProps = BlockItemComponent & { enableContentLinks: boolean };

const CollectionFragmentMeta: FC<CollectionFragmentMetaProps> = ({ block, enableContentLinks }) => {
	const [t] = useTranslation();

	const organisation = block.item_meta?.organisation?.name;
	const publishedAt = block.item_meta?.published_at;
	const series = (block.item_meta as ItemSchema)?.series;

	return organisation || publishedAt || series ? (
		<section className="u-spacer-bottom">
			{organisation && (
				<div>
					{t('collection/views/collection-detail___uitzender')}:<b> {organisation}</b>
				</div>
			)}

			{publishedAt && (
				<div>
					{t('collection/views/collection-detail___uitzenddatum')}:<b> {publishedAt}</b>
				</div>
			)}

			{series && (
				<div>
					{t('collection/views/collection-detail___reeks')}:{' '}
					{enableContentLinks ? (
						<Link
							target="_blank"
							to={buildLink(APP_PATH.SEARCH.route, undefined, {
								filters: JSON.stringify({
									[SearchFilter.serie]: [series],
								}),
							})}
						>
							<b>{series}</b>
						</Link>
					) : (
						<b>{series}</b>
					)}
				</div>
			)}
		</section>
	) : null;
};

export default CollectionFragmentMeta;
