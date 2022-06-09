import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { FragmentComponent } from '../collection.types';

export interface CollectionFragmentMetaProps extends FragmentComponent {}

const CollectionFragmentMeta: FC<CollectionFragmentMetaProps> = ({ fragment }) => {
	const [t] = useTranslation();

	const organisation = fragment.item_meta?.organisation?.name;
	const publishedAt = fragment.item_meta?.published_at;
	const series = undefined; // TODO: determine & configure corresponding meta field

	return organisation || publishedAt || series ? (
		<section className="u-spacer-bottom">
			{organisation && (
				<div>
					{t('collection/views/collection-detail___uitzender')}: <b>{organisation}</b>
				</div>
			)}

			{publishedAt && (
				<div>
					{t('collection/views/collection-detail___uitzenddatum')}: <b>{publishedAt}</b>
				</div>
			)}

			{series && (
				<div>
					{t('collection/views/collection-detail___reeks')}: <b>{series}</b>
				</div>
			)}
		</section>
	) : null;
};

export default CollectionFragmentMeta;
