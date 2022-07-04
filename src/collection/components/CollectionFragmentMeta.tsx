import { ItemSchema } from '@viaa/avo2-types/types/item';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { SearchFilter } from '../../search/search.const';
import { buildLink } from '../../shared/helpers';
import { FragmentComponent } from '../collection.types';

export type CollectionFragmentMetaProps = FragmentComponent;

const CollectionFragmentMeta: FC<CollectionFragmentMetaProps> = ({ fragment }) => {
	const [t] = useTranslation();

	const organisation = fragment.item_meta?.organisation?.name;
	const publishedAt = fragment.item_meta?.published_at;
	const series = (fragment.item_meta as ItemSchema)?.series;

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
				</div>
			)}
		</section>
	) : null;
};

export default CollectionFragmentMeta;
