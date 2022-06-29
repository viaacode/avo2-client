import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ItemSchema } from '@viaa/avo2-types/types/item';

import { APP_PATH } from '../../constants';
import { SEARCH_FILTER_STATE_SERIES_PROP } from '../../shared/constants';
import { buildLink } from '../../shared/helpers';
import { FragmentComponent } from '../collection.types';

export interface CollectionFragmentMetaProps extends FragmentComponent {}

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
					{t('collection/views/collection-detail___reeks')}:
					<Link
						target="_blank"
						to={buildLink(APP_PATH.SEARCH.route, undefined, {
							filters: JSON.stringify({
								[SEARCH_FILTER_STATE_SERIES_PROP]: [series],
							}),
						})}
					>
						<b> {series}</b>
					</Link>
				</div>
			)}
		</section>
	) : null;
};

export default CollectionFragmentMeta;
